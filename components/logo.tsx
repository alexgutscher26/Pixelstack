import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex flex-1 items-center gap-1 text-2xl">
      <span className="text-primary inline-block font-extrabold">X</span>
      <span className="text-foreground font-semibold">design.ai</span>
    </Link>
  );
};

export default Logo;
