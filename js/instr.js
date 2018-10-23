var INSTR = {};

INSTR[0] = function () {
	STAT = 'HLT';
	PC = new Long(0);
	//print("Program halted");
};
INSTR[1] = function () {
	//NOP
};
INSTR[2] = function () {
	switch(this.fn) {
		case 0:
			// RRMOVQ
			REG[this.rB] = getRegister(this.rA);
			break;
		case 1:
			// CMOVLE
			if (SF === 1 || ZF === 1) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 2:
			// CMOVL
			if (SF === 1) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 3:
			// CMOVE
			if (ZF === 1) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 4:
			// CMOVNE
			if (ZF === 0) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 5:
			// CMOVGE
			if (SF === 0) {
				getRegister(this.rB) = getRegister(this.rA);
			}
			break;
		case 6:
			// CMOVG
			if (SF === 0 && ZF === 0) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
	}
};
INSTR[3] = function () {
	if(typeof(this.V) == "object"){
		REG[this.rB] = this.V;
	}else{
		REG[this.rB] = new Long(this.V);
	}
};
INSTR[4] = function () {
        var valA = getRegister(this.rA);
        var valB = new Long(0); // valB is zero if rB is not used
        if(!this.rB != 15) valB = getRegister(this.rB); 
        var valE = valB.add(this.D);    
	ST(valE.toInt(), valA, 8);
};
INSTR[5] = function () {
        var valB = new Long(0); // valB is zero if rB is not used
        if(this.rB != 15) valB = getRegister(this.rB); 
        var valE = valB.add(this.D);
	REG[this.rA] = LD(valE.toInt());
};
INSTR[6] = function () { // op
	var valA = getRegister(this.rA),
		valB = getRegister(this.rB),
		sgnA, sgnB, sgnR;

	sgnA = !!(valA.toBytes()[0] & 0x80);
	sgnB = !!(valB.toBytes()[0] & 0x80);

	switch(this.fn) {
		case 0:
			REG[this.rB] = REG[this.rB].add(getRegister(this.rA));
			sgnR = !!(getRegister(this.rB).toBytes()[0] & 0x80);
			OF = +( sgnA &&  sgnB && !sgnR ||
			       !sgnA && !sgnB &&  sgnR)
			break;
		case 1:
			REG[this.rB] = REG[this.rB].subtract(getRegister(this.rA));
			sgnR = !!(getRegister(this.rB).toBytes()[0] & 0x80);
			OF = +( sgnA && !sgnB &&  sgnR ||
			       !sgnA &&  sgnB && !sgnR)
			break;
		case 2:
			REG[this.rB] = getRegister(this.rA).and(getRegister(this.rB));
			break;
		case 3:
			REG[this.rB] = getRegister(this.rA).xor(getRegister(this.rB));
			break;
	}
	SF = getRegister(this.rB).toBytes()[0] & 0x80 ? 1 : 0;
	ZF = getRegister(this.rB).toString() === "0" ? 1 : 0;
};
INSTR[7] = function ()  {
	switch(this.fn) {
		case 0:
			// JMP
			PC = this.Dest;
			break;
		case 1:
			// JLE
			if (SF === 1 || ZF === 1) {
				PC = this.Dest;
			}
			break;
		case 2:
			// JL
			if (SF === 1) {
				PC = this.Dest;
			}
			break;
		case 3:
			// JE
			if (ZF === 1) {
				PC = this.Dest;
			}
			break;
		case 4:
			// JNE
			if (ZF === 0) {
				PC = this.Dest;
			}
			break;
		case 5:
			// JGE
			if (SF === 0) {
				PC = this.Dest;
			}
			break;
		case 6:
			// JG
			if (SF === 0 && ZF === 0) {
				PC = this.Dest;
			}
			break;
	}
};
INSTR[8] = function () {
	var valB = getRegister(4),
		valE = valB.subtract(8);
	ST(valE.toInt(), PC, 8);
	REG[4] = valE;
	PC = this.Dest;
};
INSTR[9] = function () {
	var valA = getRegister(4),
		valB = getRegister(4),
		valE = valB.add(8),
		valM = LD(valA.toInt());
	REG[4] = valE;
	PC = valM;
};
INSTR[10] = function () {
	var valA = getRegister(this.rA),
		valB = getRegister(4),
		valE = valB.subtract(8);
	ST(valE.toInt(), valA, 8);
	REG[4] = valE;
};
INSTR[11] = function () {
	var valA = getRegister(4),
		valB = getRegister(4),
		valE = valB.add(8),
		valM = LD(valA.toInt());
	REG[4] = valE;
	REG[this.rA] = valM;
};

INSTR[12] = function () { // iaddq, isubq, iandq, ixorq
    var valA = this.V;
    var valB = getRegister(this.rB);
    var sgnA, sgnB, sgnR;
    switch(this.fn) {
    case 0:
		sgnA = !!(valA.toBytes()[0] & 0x80);
		sgnB = !!(valB.toBytes()[0] & 0x80);
		REG[this.rB] = REG[this.rB].add(valA);
		sgnR = !!(getRegister(this.rB).toBytes()[0] & 0x80);
		OF = +( sgnA &&  sgnB && !sgnR ||
		       !sgnA && !sgnB &&  sgnR)
		break;
    case 1:
		sgnA = !!(valA.toBytes()[0] & 0x80);
		sgnB = !!(valB.toBytes()[0] & 0x80);
		REG[this.rB] = REG[this.rB].subtract(valA);
		sgnR = !!(getRegister(this.rB).toBytes()[0] & 0x80);
		OF = +( sgnA && !sgnB &&  sgnR ||
		       !sgnA &&  sgnB && !sgnR)
		break;
    case 2:
		REG[this.rB] = valA.and(getRegister(this.rB));
		break;
    case 3:
		REG[this.rB] = valA.xor(getRegister(this.rB));
		break;
    }
    SF = getRegister(this.rB).toBytes()[0] & 0x80 ? 1 : 0;
    ZF = getRegister(this.rB).toString() === "0" ? 1 : 0;
};

INSTR[15] = function () {
	switch(this.fn) {
		case 0:
			// BRK
			STAT = 'DBG';
			break;
		case 1:
			// BRKLE
			if (SF === 1 || ZF === 1) {
				STAT = 'DBG';
			}
			break;
		case 2:
			// BRKL
			if (SF === 1) {
				STAT = 'DBG';
			}
			break;
		case 3:
			// BRKE
			if (ZF === 1) {
				STAT = 'DBG';
			}
			break;
		case 4:
			// BRKNE
			if (ZF === 0) {
				STAT = 'DBG';
			}
			break;
		case 5:
			// BRKGE
			if (SF === 0 || ZF === 1) {
				STAT = 'DBG';
			}
			break;
		case 6:
			// BRKG
			if (SF === 0 && ZF === 0) {
				STAT = 'DBG';
			}
			break;
	}
};
