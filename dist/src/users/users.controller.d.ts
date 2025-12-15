import { HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(body: CreateUserDto & {
        companyId?: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    login(loginDto: LoginDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        accessToken: string;
        user: any;
    }>;
    create(createUserDto: CreateUserDto, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    getCurrentUser(userId: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    updateCurrentUser(userId: number, updateUserDto: UpdateUserDto, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    findAll(companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User[];
    }>;
    findOne(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    update(id: number, updateUserDto: UpdateUserDto, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    ban(id: number, dto: BanUserDto, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    unban(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    remove(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
