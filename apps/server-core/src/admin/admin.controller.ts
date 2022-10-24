import {Controller, Delete, Get, Post} from '@nestjs/common';

import {AdminService} from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getData() {
    return this.adminService.getData();
  }
  @Delete()
  resetDB() {
    return this.adminService.resetDB();
  }
  @Post()
  setSchema() {
    return this.adminService.setSchema();
  }
}
