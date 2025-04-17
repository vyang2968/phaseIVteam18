import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import Link from 'next/link';

export default function AppNavigationMenu({ className }: { className: string }) {
  // A helper function to create the navigation trigger style
  const navigationMenuTriggerStyle = () => {
    return "group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-slate-100/50 data-[state=open]:bg-slate-100/50";
  };

  return (
    <NavigationMenu className={`${className}`}>
      <div className="w-screen px-4 flex justify-between items-center h-16">
        <div>
          <Link href="/" className='cursor-pointer'>
            <h1 className="text-xl font-bold text-slate-900 cursor-pointer">
              CS4400 Phase IV Project
            </h1>
          </Link>

        </div>

        <NavigationMenuList className="flex gap-2">
          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              href="/crud"
            >
              CRUD
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              href="/views"
            >
              Views
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              href="/procedures"
            >
              Procedures
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );

}