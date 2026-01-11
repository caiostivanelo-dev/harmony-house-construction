import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_SUBSCRIPTION_KEY = 'isPublicSubscription';
export const PublicSubscription = () => SetMetadata(IS_PUBLIC_SUBSCRIPTION_KEY, true);
