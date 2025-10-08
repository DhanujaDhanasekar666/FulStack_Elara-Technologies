import mongoose from 'mongoose';

const PayrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    period: {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        year: {
            type: Number,
            required: true
        }
    },
    salary: {
        baseSalary: {
            type: Number,
            required: true,
            min: 0
        },
        bonus: {
            type: Number,
            default: 0,
            min: 0
        },
        overtime: {
            type: Number,
            default: 0,
            min: 0
        },
        allowances: {
            houseRent: { type: Number, default: 0 },
            transport: { type: Number, default: 0 },
            medical: { type: Number, default: 0 },
            other: { type: Number, default: 0 }
        }
    },
    deductions: {
        tax: {
            type: Number,
            default: 0,
            min: 0
        },
        insurance: {
            type: Number,
            default: 0,
            min: 0
        },
        providentFund: {
            type: Number,
            default: 0,
            min: 0
        },
        loan: {
            type: Number,
            default: 0,
            min: 0
        },
        other: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    netPay: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Processed', 'Paid', 'On Hold'],
        default: 'Pending'
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    },
    paidAt: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['Bank Transfer', 'Cash', 'Cheque'],
        default: 'Bank Transfer'
    },
    notes: {
        type: String
    },
    payslipUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
PayrollSchema.index({ employee: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });
PayrollSchema.index({ status: 1 });

// Calculate net pay before saving
PayrollSchema.pre('save', function(next) {
    const grossPay = 
        this.salary.baseSalary + 
        this.salary.bonus + 
        this.salary.overtime +
        (this.salary.allowances.houseRent || 0) +
        (this.salary.allowances.transport || 0) +
        (this.salary.allowances.medical || 0) +
        (this.salary.allowances.other || 0);
    
    const totalDeductions = 
        this.deductions.tax +
        this.deductions.insurance +
        this.deductions.providentFund +
        this.deductions.loan +
        this.deductions.other;
    
    this.netPay = grossPay - totalDeductions;
    next();
});

export default mongoose.model('Payroll', PayrollSchema);






