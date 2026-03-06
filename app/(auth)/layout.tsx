import { BrandLogo } from "@/components/brand-logo";

const AuthLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return ( 
    <div className="h-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <BrandLogo />
        {children}
      </div>
    </div>
   );
}
 
export default AuthLayout;
