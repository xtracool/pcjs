/**
 * @fileoverview Implements the PCjs Bus component.
 * @author <a href="mailto:Jeff@pcjs.org">Jeff Parsons</a>
 * @version 1.0
 * Created 2012-Sep-04
 *
 * Copyright © 2012-2015 Jeff Parsons <Jeff@pcjs.org>
 *
 * This file is part of PCjs, which is part of the JavaScript Machines Project (aka JSMachines)
 * at <http://jsmachines.net/> and <http://pcjs.org/>.
 *
 * PCjs is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * PCjs is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with PCjs.  If not,
 * see <http://www.gnu.org/licenses/gpl.html>.
 *
 * You are required to include the above copyright notice in every source code file of every
 * copy or modified version of this work, and to display that copyright notice on every screen
 * that loads or runs any version of this software (see Computer.sCopyright).
 *
 * Some PCjs files also attempt to load external resource files, such as character-image files,
 * ROM files, and disk image files. Those external resource files are not considered part of the
 * PCjs program for purposes of the GNU General Public License, and the author does not claim
 * any copyright as to their contents.
 */

"use strict";

if (typeof module !== 'undefined') {
    var str         = require("../../shared/lib/strlib");
    var usr         = require("../../shared/lib/usrlib");
    var Component   = require("../../shared/lib/component");
    var Memory      = require("./memory");
    var Messages    = require("./messages");
    var State       = require("./state");
    var X86         = require("./x86");
}

/**
 * Bus(cpu, dbg)
 *
 * The Bus component manages physical memory and I/O address spaces.
 *
 * The Bus component has no UI elements, so it does not require an init() handler,
 * but it still inherits from the Component class and must be allocated like any
 * other device component.  It's currently allocated by the Computer's init() handler,
 * which then calls the initBus() method of all the other components.
 *
 * When initMemory() initializes the entire address space, it also passes aMemBlocks
 * to the CPU object, so that the CPU can perform its own address-to-block calculations
 * (essential, for example, when the CPU enables paging).
 *
 * For memory beyond the simple needs of the ROM and RAM components (ie, memory-mapped
 * devices), the address space must still be allocated through the Bus component via
 * addMemory().  If the component needs something more than simple read/write storage,
 * it must provide a controller with getMemoryBuffer() and getMemoryAccess() methods.
 *
 * By contrast, all port (I/O) operations are defined by external handlers; they register
 * with us, and we manage those registrations, as well as support for I/O breakpoints,
 * but unlike memory accesses, we're not involved with port data accesses.
 *
 * @constructor
 * @extends Component
 * @param {Object} parmsBus
 * @param {X86CPU} cpu
 * @param {Debugger} dbg
 */
function Bus(parmsBus, cpu, dbg)
{
    Component.call(this, "Bus", parmsBus, Bus);

    this.cpu = cpu;
    this.dbg = dbg;

    this.nBusWidth = parmsBus['buswidth'] || 20;

    /*
     * Compute all Bus memory block parameters, based on the width of the bus.
     *
     * Regarding blockTotal, we want to avoid using block overflow expressions like:
     *
     *      iBlock < this.nBlockTotal? iBlock : 0
     *
     * As long as we know that blockTotal is a power of two (eg, 256 or 0x100, in the case of
     * nBusWidth == 20 and blockSize == 4096), we can define blockMask as (blockTotal - 1) and
     * rewrite the previous expression as:
     *
     *      iBlock & this.nBlockMask
     *
     * Similarly, we mask addresses with busMask to enforce "A20 wrap" on 20-bit busses.
     * For larger busses, A20 wrap can be simulated by either clearing bit 20 of busMask or by
     * changing all the block entries for the 2nd megabyte to match those in the 1st megabyte.
     *
     *      Bus Property        Old hard-coded values (when nBusWidth was always 20)
     *      ------------        ----------------------------------------------------
     *      this.nBusLimit      0xfffff
     *      this.nBusMask       [same as busLimit]
     *      this.nBlockSize     4096
     *      this.nBlockLen      (this.nBlockSize >> 2)
     *      this.nBlockShift    12
     *      this.nBlockLimit    0xfff
     *      this.nBlockTotal    ((this.nBusLimit + this.nBlockSize) / this.nBlockSize) | 0
     *      this.nBlockMask     (this.nBlockTotal - 1) [ie, 0xff]
     *
     * Note that we choose a nBlockShift value (and thus a physical memory block size) based on "buswidth":
     *
     *      Bus Width                       Block Shift     Block Size
     *      ---------                       -----------     ----------
     *      20 bits (1Mb address space):    12              4Kb (256 maximum blocks)
     *      24 bits (16Mb address space):   14              16Kb (1K maximum blocks)
     *      32 bits (4Gb address space);    15              32Kb (128K maximum blocks)
     *
     * The coarser block granularities (ie, 16Kb and 32Kb) may cause problems for certain RAM and/or ROM
     * allocations that are contiguous but are allocated out of order, or that have different controller
     * requirements.  Your choices, for the moment, are either to ensure the allocations are performed in
     * order, or to choose smaller nBlockShift values (at the expense of a generating a larger block array).
     *
     * Note that if PAGEBLOCKS is set, then for a bus width of 32 bits, the block size is fixed at 4Kb.
     */
    this.addrTotal = Math.pow(2, this.nBusWidth);
    this.nBusLimit = this.nBusMask = (this.addrTotal - 1) | 0;
    this.nBlockShift = (PAGEBLOCKS && this.nBusWidth == 32 || this.nBusWidth <= 20)? 12 : (this.nBusWidth <= 24? 14 : 15);
    this.nBlockSize = 1 << this.nBlockShift;
    this.nBlockLen = this.nBlockSize >> 2;
    this.nBlockLimit = this.nBlockSize - 1;
    this.nBlockTotal = (this.addrTotal / this.nBlockSize) | 0;
    this.nBlockMask = this.nBlockTotal - 1;
    this.assert(this.nBlockMask <= Bus.BlockInfo.num.mask);

    /*
     * Lists of I/O notification functions: aPortInputNotify and aPortOutputNotify are arrays, indexed by
     * port, of sub-arrays which contain:
     *
     *      [0]: registered function to call for every I/O access
     *
     * The registered function is called with the port address, and if the access was triggered by the CPU,
     * the linear instruction pointer (LIP) at the point of access.
     *
     * WARNING: Unlike the (old) read and write memory notification functions, these support only one
     * pair of input/output functions per port.  A more sophisticated architecture could support a list
     * of chained functions across multiple components, but I doubt that will be necessary here.
     *
     * UPDATE: The Debugger now piggy-backs on these arrays to indicate ports for which it wants notification
     * of I/O.  In those cases, the registered component/function elements may or may not be set, but the
     * following additional element will be set:
     *
     *      [1]: true to break on I/O, false to ignore I/O
     *
     * The false case is important if fPortInputBreakAll and/or fPortOutputBreakAll is set, because it allows the
     * Debugger to selectively ignore specific ports.
     */
    this.aPortInputNotify = [];
    this.aPortOutputNotify = [];
    this.fPortInputBreakAll = this.fPortOutputBreakAll = false;

    /*
     * Allocate empty Memory blocks to span the entire physical address space.
     */
    this.initMemory();

    if (BACKTRACK) {
        this.abtObjects = [];
        this.cbtDeletions = 0;
        this.ibtLastAlloc = -1;
        this.ibtLastDelete = 0;
    }

    this.setReady();
}

Component.subclass(Bus);

if (BACKTRACK) {
    /**
     * BackTrack object definition
     *
     *  obj:        reference to the source object (eg, ROM object, Sector object)
     *  off:        the offset within the source object that this object refers to
     *  slot:       the slot (+1) in abtObjects which this object currently occupies
     *  refs:       the number of memory references, as recorded by writeBackTrack()
     *
     * @typedef {{
     *  obj:        Object,
     *  off:        number,
     *  slot:       number,
     *  refs:       number
     * }}
     */
    var BackTrack;

    /*
     * BackTrack indexes are 31-bit values, where bits 0-8 store an object offset (0-511) and bits 16-30 store
     * an object number (1-32767).  Object number 0 is reserved for dynamic data (ie, data created independent
     * of any source); examples include zero values produced by instructions such as "SUB AX,AX" or "XOR AX,AX".
     * We must special-case instructions like that, because even though AX will almost certainly contain some source
     * data prior to the instruction, the result no longer has any connection to the source.  Similarly, "SBB AX,AX"
     * may produce 0 or -1, depending on carry, but since we don't track the source of individual bits (including the
     * carry flag), AX is now source-less.  TODO: This is an argument for maintaining source info on selected flags,
     * even though it would be rather expensive.
     *
     * The 7 middle bits (9-15) record type and access information, as follows:
     *
     *      bit 15: set to indicate a "data" byte, clear to indicate a "code" byte
     *
     * All bytes start out as "data" bytes; only once they've been executed do they become "code" bytes.  For code
     * bytes, the remaining 6 middle bits (9-14) represent an execution count that starts at 1 (on the byte's initial
     * transition from data to code) and tops out at 63.
     *
     * For data bytes, the remaining middle bits indicate any transformations the data has undergone; eg:
     *
     *      bit 14: ADD/SUB/INC/DEC
     *      bit 13: MUL/DIV
     *      bit 12: OR/AND/XOR/NOT
     *
     * We make no attempt to record the original data or the transformation data, only that the transformation occurred.
     *
     * Other middle bits indicate whether the data was ever read and/or written:
     *
     *      bit 11: READ
     *      bit 10: WRITE
     *
     * Bit 9 is reserved for now.
     */
    Bus.BACKTRACK = {
        SLOT_MAX:       32768,
        SLOT_SHIFT:     16,
        TYPE_DATA:      0x8000,
        TYPE_ADDSUB:    0x4000,
        TYPE_MULDIV:    0x2000,
        TYPE_LOGICAL:   0x1000,
        TYPE_READ:      0x0800,
        TYPE_WRITE:     0x0400,
        TYPE_COUNT_INC: 0x0200,
        TYPE_COUNT_MAX: 0x7E00,
        TYPE_MASK:      0xFE00,
        TYPE_SHIFT:     9,
        OFF_MAX:        512,
        OFF_MASK:       0x1FF
    };
}

/**
 * @typedef {number}
 */
var BlockInfo;

/**
 * This defines the BlockInfo bit fields used by scanMemory() when it creates the aBlocks array.
 *
 * @typedef {{
 *  num:    BitField,
 *  count:  BitField,
 *  btmod:  BitField,
 *  type:   BitField
 * }}
 */
Bus.BlockInfo = usr.defineBitFields({num:20, count:8, btmod:1, type:3});

/**
 * BusInfo object definition (returned by scanMemory())
 *
 *  cbTotal:    total bytes allocated
 *  cBlocks:    total Memory blocks allocated
 *  aBlocks:    array of allocated Memory block numbers
 *
 * @typedef {{
 *  cbTotal:    number,
 *  cBlocks:    number,
 *  aBlocks:    Array.<BlockInfo>
 * }}
 */
var BusInfo;

/**
 * initMemory()
 *
 * Allocate enough (empty) Memory blocks to span the entire physical address space.
 *
 * @this {Bus}
 */
Bus.prototype.initMemory = function()
{
    var block = new Memory();
    this.aMemBlocks = new Array(this.nBlockTotal);
    for (var iBlock = 0; iBlock < this.nBlockTotal; iBlock++) {
        this.aMemBlocks[iBlock] = block;
    }
    this.cpu.initMemory(this.aMemBlocks, this.nBlockShift);
    this.cpu.setAddressMask(this.nBusMask);
};

/**
 * reset()
 *
 * @this {Bus}
 */
Bus.prototype.reset = function()
{
    this.setA20(true);
    if (BACKTRACK) this.ibtLastDelete = 0;
};

/**
 * powerUp(data, fRepower)
 *
 * We don't need a powerDown() handler, because for largely historical reasons, our state (including the A20 state)
 * is saved by the saveMemory(), which called by the CPU.
 *
 * However, we do need a powerUp() handler, because on resumable machines, the Computer's onReset() function calls
 * everyone's powerUp() handler rather than their reset() handler.
 *
 * TODO: Perhaps Computer should be smarter: if there's no powerUp() handler, then fallback to the reset() handler.
 * In that case, however, we'd either need to remove the powerUp() stub in Component, or detect the existence of the stub.
 *
 * @this {Bus}
 * @param {Object|null} data (always null because we supply no powerDown() handler)
 * @param {boolean} [fRepower]
 * @return {boolean} true if successful, false if failure
 */
Bus.prototype.powerUp = function(data, fRepower)
{
    if (!fRepower) this.reset();
    return true;
};

/**
 * addMemory(addr, size, type, controller)
 *
 * Adds new Memory blocks to the specified address range.  Any Memory blocks previously
 * added to that range must first be removed via removeMemory(); otherwise, you'll get
 * an allocation conflict error.  This helps prevent address calculation errors, redundant
 * allocations, etc.
 *
 * We've relaxed some of the original requirements (ie, that addresses must start at a
 * block-granular address, or that sizes must be equal to exactly one or more blocks), because
 * machines with large block sizes can make it impossible to load certain ROMs at at their
 * required addresses.
 *
 * Even so, Bus memory management does NOT provide a general-purpose heap.  Most memory
 * allocations occur during machine initialization and never change.  The only notable
 * exception is the Video frame buffer, which ranges from 4Kb (MDA) to 16Kb (CGA) to
 * 32Kb/64Kb/128Kb (EGA), and only the EGA changes its buffer address post-initialization.
 *
 * Each Memory block keeps track of a single address (addr) and length (used), indicating
 * the used space within the block; any free space that precedes or follows that used space
 * can be allocated later, by simply extending the beginning or ending of the previously used
 * space.  However, any holes that might have existed between the original allocation and an
 * extension are subsumed by the extension.
 *
 * @this {Bus}
 * @param {number} addr is the starting physical address of the request
 * @param {number} size of the request, in bytes
 * @param {number} type is one of the Memory.TYPE constants
 * @param {Object} [controller] is an optional memory controller component
 * @return {boolean} true if successful, false if not
 */
Bus.prototype.addMemory = function(addr, size, type, controller)
{
    var iBlock = addr >>> this.nBlockShift;
    while (size > 0 && iBlock < this.aMemBlocks.length) {
        var block = this.aMemBlocks[iBlock];
        var addrBlock = iBlock * this.nBlockSize;
        var sizeBlock = size > this.nBlockSize? this.nBlockSize : size;

        if (block && block.size) {
            if (block.type == type && block.controller == controller) {
                /*
                 * Where there is already a block with a non-zero size, we can allow the allocation only if:
                 *
                 *   1) addr + size <= block.addr (the request precedes the used portion of the current block)
                 * or:
                 *   2) addr >= block.addr + block.used (the request follows the used portion of the current block)
                 */
                if (addr + size <= block.addr) {
                    block.used += (block.addr - addr);
                    block.addr = addr;
                    return true;
                }
                if (addr >= block.addr + block.used) {
                    var sizeAvail = block.size - (addr - addrBlock);
                    if (sizeAvail > size) sizeAvail = size;
                    block.used = addr - block.addr + sizeAvail;
                    size -= sizeAvail;
                    addr = addrBlock + this.nBlockSize;
                    continue;
                }
            }
            return this.reportError(1, addr, size);
        }
        var blockOld = this.aMemBlocks[iBlock];
        var blockNew = new Memory(addr, sizeBlock, this.nBlockSize, type, controller);
        blockNew.copyBreakpoints(blockOld, this.dbg);
        this.aMemBlocks[iBlock++] = blockNew;
        addr = addrBlock + this.nBlockSize;
        size -= sizeBlock;
    }
    if (size > 0) {
        return this.reportError(2, addr, size);
    }
    return true;
};

/**
 * cleanMemory(addr, size)
 *
 * @this {Bus}
 * @param {number} addr
 * @param {number} size
 * @return {boolean} true if all blocks were clean, false if dirty; all blocks are cleaned in the process
 */
Bus.prototype.cleanMemory = function(addr, size)
{
    var fClean = true;
    var iBlock = addr >>> this.nBlockShift;
    while (size > 0 && iBlock < this.aMemBlocks.length) {
        if (this.aMemBlocks[iBlock].fDirty) {
            this.aMemBlocks[iBlock].fDirty = fClean = false;
            this.aMemBlocks[iBlock].fDirtyEver = true;
        }
        size -= this.nBlockSize;
        iBlock++;
    }
    return fClean;
};

/**
 * scanMemory(info, addr, size)
 *
 * Returns a BusInfo object for the specified address range.
 *
 * @this {Bus}
 * @param {Object} [info] previous BusInfo, if any
 * @param {number} [addr] starting address of range (0 if none provided)
 * @param {number} [size] size of range, in bytes (up to end of address space if none provided)
 * @return {Object} updated info (or new info if no previous info provided)
 */
Bus.prototype.scanMemory = function(info, addr, size)
{
    if (addr == null) addr = 0;
    if (size == null) size = (this.addrTotal - addr) | 0;
    if (info == null) info = {cbTotal: 0, cBlocks: 0, aBlocks: []};

    var iBlock = addr >>> this.nBlockShift;
    var iBlockMax = ((addr + size - 1) >>> this.nBlockShift);

    info.cbTotal = 0;
    info.cBlocks = 0;
    while (iBlock <= iBlockMax) {
        var block = this.aMemBlocks[iBlock];
        info.cbTotal += block.size;
        if (block.size) {
            var btmod = (BACKTRACK && block.modBackTrack(false)? 1 : 0);
            info.aBlocks.push(usr.initBitFields(Bus.BlockInfo, iBlock, 0, btmod, block.type));
            info.cBlocks++
        }
        iBlock++;
    }
    return info;
};

/**
 * getA20()
 *
 * @this {Bus}
 * @return {boolean} true if enabled, false if disabled
 */
Bus.prototype.getA20 = function()
{
    return !this.aBlocks2Mb && this.nBusLimit == this.nBusMask;
};

/**
 * setA20(fEnable)
 *
 * On 32-bit bus machines, I've adopted the approach that Compaq took with DeskPro 386 machines,
 * which is to map the 1st Mb to the 2nd Mb whenever A20 is disabled, rather than blindly masking
 * the A20 address bit from all addresses; in fact, this is what the DeskPro 386 ROM BIOS requires.
 *
 * For 24-bit bus machines, we take the same approach that most if not all 80286 systems took, which
 * is simply masking the A20 address bit.  A lot of 32-bit machines probably took the same approach.
 *
 * TODO: On machines with a 32-bit bus, look into whether we can eliminate address masking altogether,
 * which seems feasible, provided all incoming addresses are already pre-truncated to 32 bits.  Also,
 * confirm that DeskPro 386 machines mapped the ENTIRE 1st Mb to the 2nd, and not simply the first 64Kb,
 * which is technically all that 8086 address wrap-around compatibility would require.
 *
 * @this {Bus}
 * @param {boolean} fEnable is true to enable A20 (default), false to disable
 */
Bus.prototype.setA20 = function(fEnable)
{
    if (this.nBusWidth == 32) {
        if (fEnable) {
            if (this.aBlocks2Mb) {
                this.setMemoryBlocks(0x100000, 0x100000, this.aBlocks2Mb);
                this.aBlocks2Mb = null;
            }
        } else {
            if (!this.aBlocks2Mb) {
                this.aBlocks2Mb = this.getMemoryBlocks(0x100000, 0x100000);
                this.setMemoryBlocks(0x100000, 0x100000, this.getMemoryBlocks(0x0, 0x100000));
            }
        }
    }
    else if (this.nBusWidth > 20) {
        var addrMask = (this.nBusMask & ~0x100000) | (fEnable? 0x100000 : 0);
        if (addrMask != this.nBusMask) {
            this.nBusMask = addrMask;
            if (this.cpu) this.cpu.setAddressMask(addrMask);
        }
    }
};

/**
 * getWidth()
 *
 * @this {Bus}
 * @return {number}
 */
Bus.prototype.getWidth = function()
{
    return this.nBusWidth;
};

/**
 * setMemoryAccess(addr, size)
 *
 * Updates the access functions in every block of the specified address range.  Since the only components
 * that should be dynamically modifying the memory access functions are those that use addMemory() with a custom
 * memory controller, we require that the block(s) being updated do in fact have a controller.
 *
 * @this {Bus}
 * @param {number} addr
 * @param {number} size
 * @param {Array.<function()>} [afn]
 * @return {boolean} true if successful, false if not
 */
Bus.prototype.setMemoryAccess = function(addr, size, afn)
{
    if (!(addr & this.nBlockLimit) && size && !(size & this.nBlockLimit)) {
        var iBlock = addr >>> this.nBlockShift;
        while (size > 0) {
            var block = this.aMemBlocks[iBlock];
            if (!block.controller) {
                return this.reportError(5, addr, size);
            }
            block.setAccess(afn, true);
            size -= this.nBlockSize;
            iBlock++;
        }
        return true;
    }
    return this.reportError(3, addr, size);
};

/**
 * removeMemory(addr, size)
 *
 * Replaces every block in the specified address range with empty Memory blocks that ignore all reads/writes.
 *
 * TODO: Update the removeMemory() interface to reflect the relaxed requirements of the addMemory() interface.
 *
 * @this {Bus}
 * @param {number} addr
 * @param {number} size
 * @return {boolean} true if successful, false if not
 */
Bus.prototype.removeMemory = function(addr, size)
{
    if (!(addr & this.nBlockLimit) && size && !(size & this.nBlockLimit)) {
        var iBlock = addr >>> this.nBlockShift;
        while (size > 0) {
            var blockOld = this.aMemBlocks[iBlock];
            var blockNew = new Memory(addr);
            blockNew.copyBreakpoints(blockOld, this.dbg);
            this.aMemBlocks[iBlock++] = blockNew;
            addr = iBlock * this.nBlockSize;
            size -= this.nBlockSize;
        }
        return true;
    }
    return this.reportError(4, addr, size);
};

/**
 * getMemoryBlocks(addr, size)
 *
 * @this {Bus}
 * @param {number} addr is the starting physical address
 * @param {number} size of the request, in bytes
 * @return {Array} of Memory blocks
 */
Bus.prototype.getMemoryBlocks = function(addr, size)
{
    var aBlocks = [];
    var iBlock = addr >>> this.nBlockShift;
    while (size > 0 && iBlock < this.aMemBlocks.length) {
        aBlocks.push(this.aMemBlocks[iBlock++]);
        size -= this.nBlockSize;
    }
    return aBlocks;
};

/**
 * setMemoryBlocks(addr, size, aBlocks, type)
 *
 * If no type is specified, then specified address range uses all the provided blocks as-is;
 * this form of setMemoryBlocks() is used for complete physical aliases.
 *
 * Otherwise, new blocks are allocated with the specified type; the underlying memory from the
 * provided blocks is still used, but the new blocks may have different access to that memory.
 *
 * @this {Bus}
 * @param {number} addr is the starting physical address
 * @param {number} size of the request, in bytes
 * @param {Array} aBlocks as returned by getMemoryBlocks()
 * @param {number} [type] is one of the Memory.TYPE constants
 */
Bus.prototype.setMemoryBlocks = function(addr, size, aBlocks, type)
{
    var i = 0;
    var iBlock = addr >>> this.nBlockShift;
    while (size > 0 && iBlock < this.aMemBlocks.length) {
        var block = aBlocks[i++];
        this.assert(block);
        if (!block) break;
        if (type !== undefined) {
            var blockNew = new Memory(addr);
            blockNew.clone(block, type, this.dbg);
            block = blockNew;
        }
        this.aMemBlocks[iBlock++] = block;
        size -= this.nBlockSize;
    }
};

/**
 * getByte(addr)
 *
 * For physical addresses only; for linear addresses, use cpu.getByte().
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @return {number} byte (8-bit) value at that address
 */
Bus.prototype.getByte = function(addr)
{
    return this.aMemBlocks[(addr & this.nBusMask) >>> this.nBlockShift].readByte(addr & this.nBlockLimit, addr);
};

/**
 * getByteDirect(addr)
 *
 * This is useful for the Debugger and other components that want to bypass getByte() breakpoint detection.
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @return {number} byte (8-bit) value at that address
 */
Bus.prototype.getByteDirect = function(addr)
{
    return this.aMemBlocks[(addr & this.nBusMask) >>> this.nBlockShift].readByteDirect(addr & this.nBlockLimit, addr);
};

/**
 * getShort(addr)
 *
 * For physical addresses only; for linear addresses, use cpu.getShort().
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @return {number} word (16-bit) value at that address
 */
Bus.prototype.getShort = function(addr)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off != this.nBlockLimit) {
        return this.aMemBlocks[iBlock].readShort(off, addr);
    }
    return this.aMemBlocks[iBlock++].readByte(off, addr) | (this.aMemBlocks[iBlock & this.nBlockMask].readByte(0, addr + 1) << 8);
};

/**
 * getShortDirect(addr)
 *
 * This is useful for the Debugger and other components that want to bypass getShort() breakpoint detection.
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @return {number} word (16-bit) value at that address
 */
Bus.prototype.getShortDirect = function(addr)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off != this.nBlockLimit) {
        return this.aMemBlocks[iBlock].readShortDirect(off, addr);
    }
    return this.aMemBlocks[iBlock++].readByteDirect(off, addr) | (this.aMemBlocks[iBlock & this.nBlockMask].readByteDirect(0, addr + 1) << 8);
};

/**
 * getLong(addr)
 *
 * For physical addresses only; for linear addresses, use cpu.getLong().
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @return {number} long (32-bit) value at that address
 */
Bus.prototype.getLong = function(addr)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off < this.nBlockLimit - 2) {
        return this.aMemBlocks[iBlock].readLong(off, addr);
    }
    var nShift = (off & 0x3) << 3;
    return (this.aMemBlocks[iBlock].readLong(off & ~0x3, addr) >>> nShift) | (this.aMemBlocks[(iBlock + 1) & this.nBlockMask].readLong(0, addr + 3) << (32 - nShift));
};

/**
 * getLongDirect(addr)
 *
 * This is useful for the Debugger and other components that want to bypass getLong() breakpoint detection.
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @return {number} long (32-bit) value at that address
 */
Bus.prototype.getLongDirect = function(addr)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off < this.nBlockLimit - 2) {
        return this.aMemBlocks[iBlock].readLongDirect(off, addr);
    }
    var nShift = (off & 0x3) << 3;
    return (this.aMemBlocks[iBlock].readLongDirect(off & ~0x3, addr) >>> nShift) | (this.aMemBlocks[(iBlock + 1) & this.nBlockMask].readLongDirect(0, addr + 3) << (32 - nShift));
};

/**
 * setByte(addr, b)
 *
 * For physical addresses only; for linear addresses, use cpu.setByte().
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} b is the byte (8-bit) value to write (we truncate it to 8 bits to be safe)
 */
Bus.prototype.setByte = function(addr, b)
{
    this.aMemBlocks[(addr & this.nBusMask) >>> this.nBlockShift].writeByte(addr & this.nBlockLimit, b & 0xff, addr);
};

/**
 * setByteDirect(addr, b)
 *
 * This is useful for the Debugger and other components that want to bypass breakpoint detection AND read-only
 * memory protection (for example, this is an interface the ROM component could use to initialize ROM contents).
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} b is the byte (8-bit) value to write (we truncate it to 8 bits to be safe)
 */
Bus.prototype.setByteDirect = function(addr, b)
{
    this.aMemBlocks[(addr & this.nBusMask) >>> this.nBlockShift].writeByteDirect(addr & this.nBlockLimit, b & 0xff, addr);
};

/**
 * setShort(addr, w)
 *
 * For physical addresses only; for linear addresses, use cpu.setShort().
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} w is the word (16-bit) value to write (we truncate it to 16 bits to be safe)
 */
Bus.prototype.setShort = function(addr, w)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off != this.nBlockLimit) {
        this.aMemBlocks[iBlock].writeShort(off, w & 0xffff, addr);
        return;
    }
    this.aMemBlocks[iBlock++].writeByte(off, w & 0xff, addr);
    this.aMemBlocks[iBlock & this.nBlockMask].writeByte(0, (w >> 8) & 0xff, addr + 1);
};

/**
 * setShortDirect(addr, w)
 *
 * This is useful for the Debugger and other components that want to bypass breakpoint detection AND read-only
 * memory protection (for example, this is an interface the ROM component could use to initialize ROM contents).
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} w is the word (16-bit) value to write (we truncate it to 16 bits to be safe)
 */
Bus.prototype.setShortDirect = function(addr, w)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off != this.nBlockLimit) {
        this.aMemBlocks[iBlock].writeShortDirect(off, w & 0xffff, addr);
        return;
    }
    this.aMemBlocks[iBlock++].writeByteDirect(off, w & 0xff, addr);
    this.aMemBlocks[iBlock & this.nBlockMask].writeByteDirect(0, (w >> 8) & 0xff, addr + 1);
};

/**
 * setLong(addr, l)
 *
 * For physical addresses only; for linear addresses, use cpu.setLong().
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} l is the long (32-bit) value to write
 */
Bus.prototype.setLong = function(addr, l)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off < this.nBlockLimit - 2) {
        this.aMemBlocks[iBlock].writeLong(off, l);
        return;
    }
    var lPrev, nShift = (off & 0x3) << 3;
    off &= ~0x3;
    lPrev = this.aMemBlocks[iBlock].readLong(off, addr);
    this.aMemBlocks[iBlock].writeLong(off, (lPrev & ~((0xffffffff|0) << nShift)) | (l << nShift), addr);
    iBlock = (iBlock + 1) & this.nBlockMask;
    addr += 3;
    lPrev = this.aMemBlocks[iBlock].readLong(0, addr);
    this.aMemBlocks[iBlock].writeLong(0, (lPrev & ((0xffffffff|0) << nShift)) | (l >>> (32 - nShift)), addr);
};

/**
 * setLongDirect(addr, l)
 *
 * This is useful for the Debugger and other components that want to bypass breakpoint detection AND read-only
 * memory protection (for example, this is an interface the ROM component could use to initialize ROM contents).
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} l is the long (32-bit) value to write
 */
Bus.prototype.setLongDirect = function(addr, l)
{
    var off = addr & this.nBlockLimit;
    var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
    if (off < this.nBlockLimit - 2) {
        this.aMemBlocks[iBlock].writeLongDirect(off, l, addr);
        return;
    }
    var lPrev, nShift = (off & 0x3) << 3;
    off &= ~0x3;
    lPrev = this.aMemBlocks[iBlock].readLongDirect(off, addr);
    this.aMemBlocks[iBlock].writeLongDirect(off, (lPrev & ~((0xffffffff|0) << nShift)) | (l << nShift), addr);
    iBlock = (iBlock + 1) & this.nBlockMask;
    addr += 3;
    lPrev = this.aMemBlocks[iBlock].readLongDirect(0, addr);
    this.aMemBlocks[iBlock].writeLongDirect(0, (lPrev & ((0xffffffff|0) << nShift)) | (l >>> (32 - nShift)), addr);
};

/**
 * addBackTrackObject(obj, bto, off)
 *
 * If bto is null, then we create bto (ie, an object that wraps obj and records off).
 *
 * If bto is NOT null, then we verify that off is within the given bto's range; if not,
 * then we must create a new bto and return that instead.
 *
 * @this {Bus}
 * @param {Object} obj
 * @param {BackTrack} bto
 * @param {number} off (the offset within obj that this wrapper object is relative to)
 * @return {BackTrack|null}
 */
Bus.prototype.addBackTrackObject = function(obj, bto, off)
{
    if (BACKTRACK && obj) {
        var cbtObjects = this.abtObjects.length;
        if (!bto) {
            /*
             * Try the most recently created bto, on the off-chance it's what the caller needs
             */
            if (this.ibtLastAlloc >= 0) bto = this.abtObjects[this.ibtLastAlloc];
        }
        if (!bto || bto.obj != obj || off < bto.off || off >= bto.off + Bus.BACKTRACK.OFF_MAX) {

            bto = {obj: obj, off: off, slot: 0, refs: 0};

            var slot;
            if (!this.cbtDeletions) {
                slot = cbtObjects;
            } else {
                for (slot = this.ibtLastDelete; slot < cbtObjects; slot++) {
                    var btoTest = this.abtObjects[slot];
                    if (!btoTest || !btoTest.refs && !this.isBackTrackWeak(slot << Bus.BACKTRACK.SLOT_SHIFT)) {
                        this.ibtLastDelete = slot + 1;
                        this.cbtDeletions--;
                        break;
                    }
                }
                /*
                 * There's no longer any guarantee that simply because cbtDeletions was non-zero that there WILL
                 * be an available (existing) slot, because cbtDeletions also counts weak references that may still
                 * be weak.
                 *
                 *      this.assert(slot < cbtObjects);
                 */
            }
            this.assert(slot < Bus.BACKTRACK.SLOT_MAX);
            this.ibtLastAlloc = slot;
            bto.slot = slot + 1;
            if (slot == cbtObjects) {
                this.abtObjects.push(bto);
            } else {
                this.abtObjects[slot] = bto;
            }
        }
        return bto;
    }
    return null;
};

/**
 * getBackTrackIndex(bto, off)
 *
 * @this {Bus}
 * @param {BackTrack|null} bto
 * @param {number} off
 * @return {number}
 */
Bus.prototype.getBackTrackIndex = function(bto, off)
{
    var bti = 0;
    if (BACKTRACK && bto) {
        bti = (bto.slot << Bus.BACKTRACK.SLOT_SHIFT) | Bus.BACKTRACK.TYPE_DATA | (off - bto.off);
    }
    return bti;
};

/**
 * writeBackTrackObject(addr, bto, off)
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {BackTrack|null} bto
 * @param {number} off
 */
Bus.prototype.writeBackTrackObject = function(addr, bto, off)
{
    if (BACKTRACK && bto) {
        this.assert(off - bto.off >= 0 && off - bto.off < Bus.BACKTRACK.OFF_MAX);
        var bti = (bto.slot << Bus.BACKTRACK.SLOT_SHIFT) | Bus.BACKTRACK.TYPE_DATA | (off - bto.off);
        this.writeBackTrack(addr, bti);
    }
};

/**
 * readBackTrack(addr)
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @return {number}
 */
Bus.prototype.readBackTrack = function(addr)
{
    if (BACKTRACK) {
        return this.aMemBlocks[(addr & this.nBusMask) >>> this.nBlockShift].readBackTrack(addr & this.nBlockLimit);
    }
    return 0;
};

/**
 * writeBackTrack(addr, bti)
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} bti
 */
Bus.prototype.writeBackTrack = function(addr, bti)
{
    if (BACKTRACK) {
        var slot = bti >>> Bus.BACKTRACK.SLOT_SHIFT;
        var iBlock = (addr & this.nBusMask) >>> this.nBlockShift;
        var btiPrev = this.aMemBlocks[iBlock].writeBackTrack(addr & this.nBlockLimit, bti);
        var slotPrev = btiPrev >>> Bus.BACKTRACK.SLOT_SHIFT;
        if (slot != slotPrev) {
            this.aMemBlocks[iBlock].modBackTrack(true);
            if (btiPrev && slotPrev) {
                var btoPrev = this.abtObjects[slotPrev-1];
                if (!btoPrev) {
                    if (DEBUGGER && this.dbg && this.dbg.messageEnabled(Messages.WARN)) {
                        this.dbg.message("writeBackTrack(%" + str.toHex(addr) + ',' + str.toHex(bti) + "): previous index (" + str.toHex(btiPrev) + ") refers to empty slot (" + slotPrev + ")");
                    }
                }
                else if (btoPrev.refs <= 0) {
                    if (DEBUGGER && this.dbg && this.dbg.messageEnabled(Messages.WARN)) {
                        this.dbg.message("writeBackTrack(%" + str.toHex(addr) + ',' + str.toHex(bti) + "): previous index (" + str.toHex(btiPrev) + ") refers to object with bad ref count (" + btoPrev.refs + ")");
                    }
                } else if (!--btoPrev.refs) {
                    /*
                     * We used to just slam a null into the previous slot and consider it gone, but there may still
                     * be "weak references" to that slot (ie, it may still be associated with a register bti).
                     *
                     * The easiest way to handle weak references is to leave the slot allocated, with the object's ref
                     * count sitting at zero, and change addBackTrackObject() to look for both empty slots AND non-empty
                     * slots with a ref count of zero; in the latter case, it should again check for weak references,
                     * after which we can re-use the slot if all its weak references are now gone.
                     */
                    if (!this.isBackTrackWeak(btiPrev)) this.abtObjects[slotPrev-1] = null;
                    /*
                     * TODO: Consider what the appropriate trigger should be for resetting ibtLastDelete to zero;
                     * if we don't OCCASIONALLY set it to zero, we may never clear out obsolete weak references,
                     * whereas if we ALWAYS set it to zero, we may be forcing addBackTrackObject() to scan the entire
                     * table too often.
                     *
                     * I'd prefer to do something like this:
                     *
                     *      if (this.ibtLastDelete > slotPrev-1) this.ibtLastDelete = slotPrev-1;
                     *
                     * or even this:
                     *
                     *      if (this.ibtLastDelete > slotPrev-1) this.ibtLastDelete = 0;
                     *
                     * But neither one of those guarantees that we will at least occasionally scan the entire table.
                     */
                    this.ibtLastDelete = 0;
                    this.cbtDeletions++;
                }
            }
            if (bti && slot) {
                var bto = this.abtObjects[slot-1];
                if (bto) {
                    this.assert(slot == bto.slot);
                    bto.refs++;
                }
            }
        }
    }
};

/**
 * isBackTrackWeak(bti)
 *
 * @param {number} bti
 * @returns {boolean} true if the given bti is still referenced by a register, false if not
 */
Bus.prototype.isBackTrackWeak = function(bti)
{
    var bt = this.cpu.backTrack;
    var slot = bti >> Bus.BACKTRACK.SLOT_SHIFT;
    return (bt.btiAL   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiAH   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiBL   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiBH   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiCL   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiCH   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiDL   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiDH   >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiBPLo >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiBPHi >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiSILo >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiSIHi >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiDILo >> Bus.BACKTRACK.SLOT_SHIFT == slot ||
            bt.btiDIHi >> Bus.BACKTRACK.SLOT_SHIFT == slot
    );
};

/**
 * updateBackTrackCode(addr, bti)
 *
 * @this {Bus}
 * @param {number} addr is a physical address
 * @param {number} bti
 */
Bus.prototype.updateBackTrackCode = function(addr, bti)
{
    if (BACKTRACK) {
        if (bti & Bus.BACKTRACK.TYPE_DATA) {
            bti = (bti & ~Bus.BACKTRACK.TYPE_MASK) | Bus.BACKTRACK.TYPE_COUNT_INC;
        } else if ((bti & Bus.BACKTRACK.TYPE_MASK) < Bus.BACKTRACK.TYPE_COUNT_MAX) {
            bti += Bus.BACKTRACK.TYPE_COUNT_INC;
        } else {
            return;
        }
        this.aMemBlocks[(addr & this.nBusMask) >>> this.nBlockShift].writeBackTrack(addr & this.nBlockLimit, bti);
    }
};

/**
 * getBackTrackObject(bti)
 *
 * @this {Bus}
 * @param {number} bti
 * @return {Object|null}
 */
Bus.prototype.getBackTrackObject = function(bti)
{
    if (BACKTRACK) {
        var slot = bti >>> Bus.BACKTRACK.SLOT_SHIFT;
        if (slot) return this.abtObjects[slot-1];
    }
    return null;
};

/**
 * getBackTrackObjectFromAddr(addr)
 *
 * @this {Bus}
 * @param {number} addr
 * @return {Object|null}
 */
Bus.prototype.getBackTrackObjectFromAddr = function(addr)
{
    return BACKTRACK? this.getBackTrackObject(this.readBackTrack(addr)) : null;
};

/**
 * getBackTrackInfo(bti, fSymbol, fNearest)
 *
 * @this {Bus}
 * @param {number} bti
 * @param {boolean} [fSymbol] (true to return only symbol)
 * @param {boolean} [fNearest] (true to return nearest symbol)
 * @return {string|null}
 */
Bus.prototype.getBackTrackInfo = function(bti, fSymbol, fNearest)
{
    if (BACKTRACK) {
        var bto = this.getBackTrackObject(bti);
        if (bto) {
            var off = bti & Bus.BACKTRACK.OFF_MASK;
            var file = bto.obj.file;
            if (file) {
                this.assert(!bto.off);
                return file.getSymbol(bto.obj.offFile + off, fNearest);
            }
            if (!fSymbol || fNearest) {
                return bto.obj.idComponent + '+' + str.toHexLong(bto.off + off);
            }
        }
    }
    return null;
};

/**
 * getBackTrackInfoFromAddr(addr)
 *
 * @this {Bus}
 * @param {number} addr
 * @return {string|null}
 */
Bus.prototype.getBackTrackInfoFromAddr = function(addr)
{
    return BACKTRACK? this.getBackTrackInfo(this.readBackTrack(addr)) : null;
};

/**
 * getSymbol(addr, fNearest)
 *
 * @this {Bus}
 * @param {number} addr
 * @param {boolean} [fNearest] (true to return nearest symbol)
 * @return {string|null}
 */
Bus.prototype.getSymbol = function(addr, fNearest)
{
    return BACKTRACK? this.getBackTrackInfo(this.readBackTrack(addr), true, fNearest) : null;
};

/**
 * saveMemory()
 *
 * The only memory blocks we save are those marked as dirty; most likely all of RAM will have been marked dirty,
 * and even if our dirty-memory flags were as smart as our dirty-sector flags (ie, were set only when a write changed
 * what was already there), it's unlikely that would reduce the number of RAM blocks we must save/restore.  At least
 * all the ROM blocks should be clean (except in the unlikely event that the Debugger was used to modify them).
 *
 * All dirty blocks will be stored in a single array, as pairs of block numbers and data arrays, like so:
 *
 *      [iBlock0, [dw0, dw1, ...], iBlock1, [dw0, dw1, ...], ...]
 *
 * In a normal 4Kb block, there will be 1K DWORD values in the data array.  Remember that each DWORD is a signed 32-bit
 * integer (because they are formed using bit-wise operator rather than floating-point math operators), so don't be
 * surprised to see negative numbers in the data.
 *
 * The above example assumes "uncompressed" data arrays.  If we choose to use "compressed" data arrays, the data arrays
 * will look like:
 *
 *      [count0, dw0, count1, dw1, ...]
 *
 * where each count indicates how many times the following DWORD value occurs.  A data array length less than 1K indicates
 * that it's compressed, since we'll only store them in compressed form if they actually shrank, and we'll use State
 * helper methods compress() and decompress() to create and expand the compressed data arrays.
 *
 * @this {Bus}
 * @return {Array} a
 */
Bus.prototype.saveMemory = function()
{
    var i = 0;
    var a = [];
    for (var iBlock = 0; iBlock < this.nBlockTotal; iBlock++) {
        var block = this.aMemBlocks[iBlock];
        /*
         * We have to check both fDirty and fDirtyEver, because we may have called cleanMemory() on some of
         * the memory blocks (eg, video memory), and while cleanMemory() will clear a dirty block's fDirty flag,
         * it also sets the dirty block's fDirtyEver flag, which is left set for the lifetime of the machine.
         */
        if (block.fDirty || block.fDirtyEver) {
            a[i++] = iBlock;
            a[i++] = State.compress(block.save());
        }
    }
    a[i] = this.getA20();
    return a;
};

/**
 * restoreMemory(a)
 *
 * This restores the contents of all Memory blocks; called by X86CPU.restore().
 *
 * In theory, we ONLY have to save/restore block contents.  Other block attributes,
 * like the type, the memory controller (if any), and the active memory access functions,
 * should already be restored, since every component (re)allocates all the memory blocks
 * it was using when it's restored.  And since the CPU is guaranteed to be the last
 * component to be restored, all those blocks (and their attributes) should be in place now.
 *
 * See saveMemory() for a description of how the memory block contents are saved.
 *
 * @this {Bus}
 * @param {Array} a
 * @return {boolean} true if successful, false if not
 */
Bus.prototype.restoreMemory = function(a)
{
    var i;
    for (i = 0; i < a.length - 1; i += 2) {
        var iBlock = a[i];
        var adw = a[i+1];
        if (adw && adw.length < this.nBlockLen) {
            adw = State.decompress(adw, this.nBlockLen);
        }
        var block = this.aMemBlocks[iBlock];
        if (!block || !block.restore(adw)) {
            /*
             * Either the block to restore hasn't been allocated, indicating a change in the machine
             * configuration since it was last saved (the most likely explanation) or there's some internal
             * inconsistency (eg, the block size is wrong).
             */
            Component.error("Unable to restore memory block " + iBlock);
            return false;
        }
    }
    if (a[i] !== undefined) this.setA20(a[i]);
    return true;
};

/**
 * addMemBreak(addr, fWrite)
 *
 * @this {Bus}
 * @param {number} addr
 * @param {boolean} fWrite is true for a memory write breakpoint, false for a memory read breakpoint
 */
Bus.prototype.addMemBreak = function(addr, fWrite)
{
    if (DEBUGGER) {
        var iBlock = addr >>> this.nBlockShift;
        this.aMemBlocks[iBlock].addBreakpoint(addr & this.nBlockLimit, fWrite);
    }
};

/**
 * removeMemBreak(addr, fWrite)
 *
 * @this {Bus}
 * @param {number} addr
 * @param {boolean} fWrite is true for a memory write breakpoint, false for a memory read breakpoint
 */
Bus.prototype.removeMemBreak = function(addr, fWrite)
{
    if (DEBUGGER) {
        var iBlock = addr >>> this.nBlockShift;
        this.aMemBlocks[iBlock].removeBreakpoint(addr & this.nBlockLimit, fWrite);
    }
};

/**
 * addPortInputBreak(port)
 *
 * @this {Bus}
 * @param {number} [port]
 * @return {boolean} true if break on port input enabled, false if disabled
 */
Bus.prototype.addPortInputBreak = function(port)
{
    if (port === undefined) {
        this.fPortInputBreakAll = !this.fPortInputBreakAll;
        return this.fPortInputBreakAll;
    }
    if (this.aPortInputNotify[port] === undefined) {
        this.aPortInputNotify[port] = [null, false];
    }
    this.aPortInputNotify[port][1] = !this.aPortInputNotify[port][1];
    return this.aPortInputNotify[port][1];
};

/**
 * addPortInputNotify(start, end, fn)
 *
 * Add a port input-notification handler to the list of such handlers.
 *
 * @this {Bus}
 * @param {number} start port address
 * @param {number} end port address
 * @param {function(number,number)} fn is called with the port and LIP values at the time of the input
 */
Bus.prototype.addPortInputNotify = function(start, end, fn)
{
    if (fn !== undefined) {
        for (var port = start; port <= end; port++) {
            if (this.aPortInputNotify[port] !== undefined) {
                Component.warning("Input port " + str.toHexWord(port) + " already registered");
                continue;
            }
            this.aPortInputNotify[port] = [fn, false];
            if (MAXDEBUG) this.log("addPortInputNotify(" + str.toHexWord(port) + ")");
        }
    }
};

/**
 * addPortInputTable(component, table, offset)
 *
 * Add port input-notification handlers from the specified table (a batch version of addPortInputNotify)
 *
 * @this {Bus}
 * @param {Component} component
 * @param {Object} table
 * @param {number} [offset] is an optional port offset
 */
Bus.prototype.addPortInputTable = function(component, table, offset)
{
    if (offset === undefined) offset = 0;
    for (var port in table) {
        this.addPortInputNotify(+port + offset, +port + offset, table[port].bind(component));
    }
};

/**
 * checkPortInputNotify(port, addrLIP)
 *
 * @this {Bus}
 * @param {number} port
 * @param {number} [addrLIP] is the LIP value at the time of the input
 * @return {number} simulated port value (0xff if none)
 *
 * NOTE: It seems that parts of the ROM BIOS (like the RS-232 probes around F000:E5D7 in the 5150 BIOS)
 * assume that ports for non-existent hardware return 0xff rather than 0x00, hence my new default (0xff) below.
 */
Bus.prototype.checkPortInputNotify = function(port, addrLIP)
{
    var bIn = 0xff;
    var aNotify = this.aPortInputNotify[port];

    if (BACKTRACK) {
        this.cpu.backTrack.btiIO = 0;
    }
    if (aNotify !== undefined) {
        if (aNotify[0]) {
            var b = aNotify[0]( port, addrLIP);
            if (b !== undefined) {
                this.assert(!(b & ~0xff));
                bIn = b;
            }
        }
        if (DEBUGGER && this.dbg && this.fPortInputBreakAll != aNotify[1]) {
            this.dbg.checkPortInput(port, bIn);
        }
    }
    else {
        if (DEBUGGER && this.dbg) {
            this.dbg.messageIO(this, port, null, addrLIP);
            if (this.fPortInputBreakAll) this.dbg.checkPortInput(port, bIn);
        }
    }
    return bIn;
};

/**
 * removePortInputNotify(start, end)
 *
 * Remove port input-notification handler(s) (to be ENABLED later if needed)
 *
 * @this {Bus}
 * @param {number} start address
 * @param {number} end address
 *
Bus.prototype.removePortInputNotify = function(start, end)
 {
    for (var port = start; port < end; port++) {
        if (this.aPortInputNotify[port]) {
            delete this.aPortInputNotify[port];
        }
    }
};
 */

/**
 * addPortOutputBreak(port)
 *
 * @this {Bus}
 * @param {number} [port]
 * @return {boolean} true if break on port output enabled, false if disabled
 */
Bus.prototype.addPortOutputBreak = function(port)
{
    if (port === undefined) {
        this.fPortOutputBreakAll = !this.fPortOutputBreakAll;
        return this.fPortOutputBreakAll;
    }
    if (this.aPortOutputNotify[port] === undefined) {
        this.aPortOutputNotify[port] = [null, false];
    }
    this.aPortOutputNotify[port][1] = !this.aPortOutputNotify[port][1];
    return this.aPortOutputNotify[port][1];
};

/**
 * addPortOutputNotify(start, end, fn)
 *
 * Add a port output-notification handler to the list of such handlers.
 *
 * @this {Bus}
 * @param {number} start port address
 * @param {number} end port address
 * @param {function(number,number)} fn is called with the port and LIP values at the time of the output
 */
Bus.prototype.addPortOutputNotify = function(start, end, fn)
{
    if (fn !== undefined) {
        for (var port = start; port <= end; port++) {
            if (this.aPortOutputNotify[port] !== undefined) {
                Component.warning("Output port " + str.toHexWord(port) + " already registered");
                continue;
            }
            this.aPortOutputNotify[port] = [fn, false];
            if (MAXDEBUG) this.log("addPortOutputNotify(" + str.toHexWord(port) + ")");
        }
    }
};

/**
 * addPortOutputTable(component, table, offset)
 *
 * Add port output-notification handlers from the specified table (a batch version of addPortOutputNotify)
 *
 * @this {Bus}
 * @param {Component} component
 * @param {Object} table
 * @param {number} [offset] is an optional port offset
 */
Bus.prototype.addPortOutputTable = function(component, table, offset)
{
    if (offset === undefined) offset = 0;
    for (var port in table) {
        this.addPortOutputNotify(+port + offset, +port + offset, table[port].bind(component));
    }
};

/**
 * checkPortOutputNotify(port, bOut, addrLIP)
 *
 * @this {Bus}
 * @param {number} port
 * @param {number} bOut
 * @param {number} [addrLIP] is the LIP value at the time of the output
 */
Bus.prototype.checkPortOutputNotify = function(port, bOut, addrLIP)
{
    var aNotify = this.aPortOutputNotify[port];
    if (aNotify !== undefined) {
        if (aNotify[0]) {
            this.assert(!(bOut & ~0xff));
            aNotify[0](port, bOut, addrLIP);
        }
        if (DEBUGGER && this.dbg && this.fPortOutputBreakAll != aNotify[1]) {
            this.dbg.checkPortOutput(port, bOut);
        }
    }
    else {
        if (DEBUGGER && this.dbg) {
            this.dbg.messageIO(this, port, bOut, addrLIP);
            if (this.fPortOutputBreakAll) this.dbg.checkPortOutput(port, bOut);
        }
    }
};

/**
 * removePortOutputNotify(start, end)
 *
 * Remove port output-notification handler(s) (to be ENABLED later if needed)
 *
 * @this {Bus}
 * @param {number} start address
 * @param {number} end address
 *
Bus.prototype.removePortOutputNotify = function(start, end)
 {
    for (var port = start; port < end; port++) {
        if (this.aPortOutputNotify[port]) {
            delete this.aPortOutputNotify[port];
        }
    }
};
 */

/**
 * reportError(op, addr, size)
 *
 * @this {Bus}
 * @param {number} op
 * @param {number} addr
 * @param {number} size
 * @return {boolean} false
 */
Bus.prototype.reportError = function(op, addr, size)
{
    Component.error("Memory block error (" + op + "," + str.toHex(addr) + "," + str.toHex(size) + ")");
    return false;
};

if (typeof module !== 'undefined') module.exports = Bus;
