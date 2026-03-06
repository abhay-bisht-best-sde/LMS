import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full">
      <div className="h-[55px] md:pl-56 fixed inset-y-0 w-full z-50">
          <Navbar />
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <div className="h-full">
          <Sidebar />
        </div>
      </div>
      <main className="md:pl-56 pt-[55px] h-full">
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;
