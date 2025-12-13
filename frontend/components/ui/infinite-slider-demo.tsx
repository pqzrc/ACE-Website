import { InfiniteSlider } from "@/components/ui/infinite-slider";
import Image from "next/image";

const PartnerLogos = [
  {
    src: "https://s3.us-east-2.amazonaws.com/harrowco.fr/IUT-Martinique/IUTMartiniquelogo.svg",
    alt: "IUT de Martinique",
    name: "IUT de la Martinique"
  },
    {
    src: "https://s3.us-east-2.amazonaws.com/harrowco.fr/HarrowCo/Logo.svg",
    alt: "Harrow & Co",
    name: "Harrow & Co"
  },
  {
    src: "https://s3.us-east-2.amazonaws.com/harrowco.fr/IUT-Martinique/Logo_couleur_ua_martinique.svg",
    alt: "Université des Antilles",
    name: "Université des Antilles"
  },
  {
    src: "/assets/logo/cvec.png",
    alt: "CVEC - Contribution de Vie Étudiante et de Campus",
    name: "CVEC"
  },
  {
    src: "/assets/logo/quad.png",
    alt: "Quad Autre",
    name: "Quad Autre"
  },
  {
    src: "/assets/logo/Logo_de_lArmee_de_lAir_et_de_lEspace.png",
    alt: "Armée de l'air et de l'espace",
    name: "Armée de l'Air et de l'Espace"
  },
  {
    src: "/assets/logo/Logo_of_the_French_Army_(Armee_de_Terre).svg",
    alt: "Armée de Terre",
    name: "Armée de Terre"
  },
  {
    src: "/assets/logo/Logo-Marine-nationale.png",
    alt: "Marine Nationale",
    name: "La Marine Nationale"
  },
  {
    src: "/assets/logo/LOGOSCHOELCHER.png",
    alt: "Ville De Schoelcher",
    name: "La ville de Schoelcher"
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
