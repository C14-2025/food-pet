import { AuthenticatedResource } from '@/components/AuthenticatedResource/AuthenticatedResource';
import AnalysisPageClient from '@/features/analysis/components/AnalysisPageClient';

export default function Page() {
  return (
    <AuthenticatedResource allowedRoles={['ADMIN']}>
      <AnalysisPageClient />
    </AuthenticatedResource>
  );
}
