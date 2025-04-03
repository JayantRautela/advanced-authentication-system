import bcryptjs from "bcryptjs";

export const hashPassword = (password: string): string => {
    // console.log(await bcryptjs.hash(password, 10));
    return bcryptjs.hashSync(password, 10);
};