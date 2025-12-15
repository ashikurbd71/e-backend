"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSystemuserDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_systemuser_dto_1 = require("./create-systemuser.dto");
class UpdateSystemuserDto extends (0, mapped_types_1.PartialType)(create_systemuser_dto_1.CreateSystemuserDto) {
}
exports.UpdateSystemuserDto = UpdateSystemuserDto;
//# sourceMappingURL=update-systemuser.dto.js.map