import { InfiniteSlider } from "@/components/ui/infinite-slider";
import Image from "next/image";

const PartnerLogos = [
  {
    src: "https://s3.us-east-2.amazonaws.com/harrowco.fr/IUT-Martinique/IUTMartiniquelogo.svg",
    alt: "IUT de Martinique",
    name: "IUT de la Martinique"
  },
  {
    src: "https://s3.us-east-2.amazonaws.com/harrowco.fr/IUT-Martinique/Logo_couleur_ua_martinique.svg",
    alt: "Université des Antilles",
    name: "Université des Antilles"
  },
  {
    src: "https://s3.us-east-2.amazonaws.com/harrowco.fr/HarrowCo/Logo.svg",
    alt: "Harrow & Co",
    name: "Harrow & Co"
  },
  {
    src: "/assets/logo/cvec.png",
    alt: "CVEC - Contribution de Vie Étudiante et de Campus",
    name: "CVEC"
  },


];

export function InfiniteSliderDemo() {
  return (
    <InfiniteSlider 
      gap={64} 
      duration={40} 
      durationOnHover={80}
      className="py-8"
    >
      {PartnerLogos.map((partner, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center min-w-[220px] group"
        >
          <div className="p-6 rounded-xl bg-white border border-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:shadow-lg">
            <Image
              src={partner.src}
              alt={partner.alt}
              width={200}
              height={80}
              className="h-[80px] w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
          <span className="mt-4 text-sm text-gray-400 group-hover:text-white transition-colors duration-300 text-center font-medium">
            {partner.name}
          </span>
        </div>
      ))}
    </InfiniteSlider>
  );
}
