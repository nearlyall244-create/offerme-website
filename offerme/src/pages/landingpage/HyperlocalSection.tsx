import { Store } from "lucide-react"
import {
  ContainerAnimated,
  ContainerStagger,
  GalleryGrid,
  GalleryGridCell,
} from "@/components/ui/cta-section-with-gallery"

const GALLERY = [
  {
    label: "Automotive",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80",
  },
  {
    label: "Supermarkets",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80",
  },
  {
    label: "Restaurants",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
  },
  {
    label: "Beauty Salon",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
  },
]

const CELL_TILT = [
  "[transform:perspective(700px)_rotateY(15deg)]",
  "[transform:perspective(700px)_rotateY(22deg)]",
  "[transform:perspective(700px)_rotateY(22deg)]",
  "[transform:perspective(700px)_rotateY(15deg)]",
]
const CELL_HOVER =
  "hover:[transform:perspective(700px)_rotateY(0deg)] transition-transform duration-500 ease-out"

export default function HyperlocalSection() {
  return (
    <section className="relative overflow-hidden bg-warm-bg">


      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 md:grid-cols-2 md:gap-12 md:py-20">
        <ContainerStagger>
          <ContainerAnimated className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <Store className="h-4 w-4" aria-hidden="true" />
            Hyperlocal Highlight
          </ContainerAnimated>
          <ContainerAnimated className="text-4xl font-bold tracking-tight text-text md:text-5xl">
            Small Shops. <span className="text-orange-500">Big Value.</span>
          </ContainerAnimated>
          <ContainerAnimated className="mt-4 max-w-xl text-base leading-relaxed text-text-muted md:mt-6 md:text-lg">
            From your neighborhood tea shop to the small mobile repair stand
            around the corner — discover every local business in one place.
          </ContainerAnimated>
        </ContainerStagger>

        <GalleryGrid className="grid-rows-[80px_160px_80px_160px_80px] gap-4 md:grid-rows-[100px_180px_100px_180px_100px] md:gap-5">
          {GALLERY.map((item, index) => (
            <GalleryGridCell
              key={item.label}
              index={index}
              className={`${CELL_TILT[index]} ${CELL_HOVER}`}
            >
              <div className="flex h-full flex-col bg-card">
                <img
                  src={item.image}
                  alt={item.label}
                  loading="lazy"
                  className="min-h-0 w-full flex-1 object-cover object-center"
                />
                <div className="px-3 py-3 text-center text-sm font-bold text-text md:text-base">
                  {item.label}
                </div>
              </div>
            </GalleryGridCell>
          ))}
        </GalleryGrid>
      </div>
    </section>
  )
}
