function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="h-auto w-full">{children}</main>;
}
export default AppLayout;
