export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
};

export const validateName = (name: string): boolean => {
    // Kiểm tra nếu tên chứa số
    const hasNumbers = /\d/.test(name);
    // Kiểm tra nếu tên không rỗng và không chứa số
    return name.trim().length > 0 && !hasNumbers;
};

export const validateRegistration = (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Kiểm tra email
    if (!data.email) {
        errors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(data.email)) {
        errors.email = 'Email không đúng định dạng';
    }

    // Kiểm tra mật khẩu
    if (!data.password) {
        errors.password = 'Vui lòng nhập mật khẩu';
    } else if (!validatePassword(data.password)) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Kiểm tra xác nhận mật khẩu
    if (!data.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (!validatePasswordMatch(data.password, data.confirmPassword)) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Kiểm tra tên
    if (!data.firstName) {
        errors.firstName = 'Vui lòng nhập tên';
    } else if (!validateName(data.firstName)) {
        errors.firstName = 'Tên không được chứa số và ký tự đặc biệt';
    }

    // Kiểm tra họ
    if (!data.lastName) {
        errors.lastName = 'Vui lòng nhập họ';
    } else if (!validateName(data.lastName)) {
        errors.lastName = 'Họ không được chứa số và ký tự đặc biệt';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

