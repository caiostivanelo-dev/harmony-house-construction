import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { CustomersModule } from '../customers/customers.module';
import { ProjectsModule } from '../projects/projects.module';
import { BrandingModule } from '../branding/branding.module';

@Module({
  imports: [
    forwardRef(() => CustomersModule),
    forwardRef(() => ProjectsModule),
    BrandingModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
