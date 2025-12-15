"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemuserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const systemuser_entity_1 = require("./entities/systemuser.entity");
const systemuser_controller_1 = require("./systemuser.controller");
const systemuser_service_1 = require("./systemuser.service");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("./jwt.strategy");
const company_id_service_1 = require("../common/services/company-id.service");
let SystemuserModule = class SystemuserModule {
};
exports.SystemuserModule = SystemuserModule;
exports.SystemuserModule = SystemuserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([systemuser_entity_1.SystemUser]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'change-me-in-prod',
                signOptions: { expiresIn: '1h' },
            }),
        ],
        controllers: [systemuser_controller_1.SystemuserController],
        providers: [systemuser_service_1.SystemuserService, jwt_strategy_1.JwtStrategy, company_id_service_1.CompanyIdService],
        exports: [jwt_1.JwtModule, passport_1.PassportModule, company_id_service_1.CompanyIdService],
    })
], SystemuserModule);
//# sourceMappingURL=systemuser.module.js.map