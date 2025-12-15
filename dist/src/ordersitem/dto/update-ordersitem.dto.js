"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrdersitemDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_ordersitem_dto_1 = require("./create-ordersitem.dto");
class UpdateOrdersitemDto extends (0, mapped_types_1.PartialType)(create_ordersitem_dto_1.CreateOrdersitemDto) {
}
exports.UpdateOrdersitemDto = UpdateOrdersitemDto;
//# sourceMappingURL=update-ordersitem.dto.js.map