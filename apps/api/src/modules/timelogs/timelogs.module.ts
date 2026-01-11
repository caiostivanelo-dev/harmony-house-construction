import { Module } from '@nestjs/common';
import { TimelogsService } from './timelogs.service';
import { TimelogsController } from './timelogs.controller';

@Module({
  controllers: [TimelogsController],
  providers: [TimelogsService],
})
export class TimelogsModule {}
