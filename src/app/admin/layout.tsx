import AdminShell from './shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell adminName="مدير النظام">{children}</AdminShell>
}
