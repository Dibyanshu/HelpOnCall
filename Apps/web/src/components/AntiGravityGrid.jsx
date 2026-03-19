import { Link } from 'react-router-dom';
import nursingImg from '../assets/tiles/nursing.png';
import homeCareImg from '../assets/tiles/home_care.png';
import recoveryImg from '../assets/tiles/recovery.png';
import teamImg from '../assets/tiles/team.png';
import palliativeImg from '../assets/tiles/palliative.png';
import serviceHero from '../assets/Service_Hero.png';
import aboutHero from '../assets/AboutUs_Hero.png';

const TILES = [
  {
    title: 'Moderate Housekeeping',
    img: homeCareImg,
    grid: 'col-span-2 row-span-1',
  },
  {
    title: 'Meal Preparation & Feeding',
    img: aboutHero,
    grid: 'col-span-1 row-span-1',
  },
  {
    title: 'Bathing',
    img: palliativeImg,
    grid: 'col-span-1 row-span-1',
  },
  {
    title: 'Personal Hygiene',
    img: nursingImg,
    grid: 'col-span-1 row-span-2',
  },
  {
    title: 'Healthcare Staffs at your doorstep',
    tagline: 'Compassionate. Expert. Tailored to Your Home.',
    type: 'abstract',
    grid: 'col-span-2 row-span-1',
    noHover: true
  },
  {
    title: 'Mobility Assistance',
    img: recoveryImg,
    grid: 'col-span-1 row-span-1',
  },
  {
    title: 'Companionship',
    img: teamImg,
    grid: 'col-span-1 row-span-1',
  },
  {
    title: 'Dressing & Grooming',
    img: serviceHero,
    grid: 'col-span-2 row-span-1',
  },
];

export default function AntiGravityGrid() {
  return (
    <section className="bg-white py-20 px-4 overflow-hidden relative">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 text-center max-w-7xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl mb-12">
            What are you looking for?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {TILES.map((tile, i) => (
            <div
              key={i}
              className={`
                relative overflow-hidden group rounded-xl border border-slate-200/50 shadow-sm transition-all duration-500
                ${tile.noHover ? '' : 'hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-200'}
                ${tile.grid}
              `}
            >
              <div className="relative h-full w-full">
                {tile.type === 'abstract' ? (
                  /* Abstract Tile for Connecting Care (No Hover) */
                  <div className="h-full w-full bg-teal-900 flex items-center justify-center p-8">
                    <div className="absolute inset-0 backdrop-blur-md" />
                    <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                      <h3 className="text-white text-xl font-black uppercase tracking-[0.2em] drop-shadow-lg">
                        {tile.title}
                      </h3>
                      <p className="text-emerald-50/80 text-sm font-medium tracking-wide max-w-sm">
                        {tile.tagline}
                      </p>
                      <Link to="/services" className="mt-2 bg-white px-6 py-2 text-sm font-bold text-emerald-900 rounded-full hover:bg-emerald-50 transition-colors shadow-lg">
                        Explore Our Services
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Image Tiles with Hover effects */
                  <>
                    <img
                      src={tile.img}
                      alt={tile.title}
                      className="h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                    />

                    {/* Subtle default overlay */}
                    <div className="absolute inset-0 bg-emerald-950/5 group-hover:bg-transparent transition-colors duration-500" />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                      <div className="text-center px-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <span className="text-white text-md font-bold uppercase tracking-widest block">
                          {tile.title}
                        </span>
                        <div className="mt-2 w-8 h-0.5 bg-emerald-400 mx-auto rounded-full" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
