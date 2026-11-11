import { handleOg } from '../_lib/og';

export const onRequestGet = async (context: any) =>
  handleOg(context, context.params.slug, 'en');
