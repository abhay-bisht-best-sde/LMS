import Image from "next/image";

export const Logo = () => {
  return (
    <Image
      height={130}
      width={150}
      alt="logo"
      src="/genomeLogo.png"
    />
  )
}