import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';

import MobileNav from './MobileNav';
import UserPanel from './UserPanel';


const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full !bg-black px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/icons/logo.png"
          width={32}
          height={32}
          alt="yoom logo"
          className="max-sm:size-10"
        />
        <p className="text-[26px] font-extrabold text-white max-sm:hidden">
          BACKROOMS
        </p>
      </Link>
      <div className="flex-between gap-5">
        <UserPanel/>

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
