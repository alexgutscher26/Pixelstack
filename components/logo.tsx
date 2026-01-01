import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex flex-1 items-center text-2xl">
      <span className="text-primary inline-block font-extrabold">Flow</span>
      <span className="text-foreground font-semibold">Kit</span>
    </Link>
  );
};

export default Logo;
