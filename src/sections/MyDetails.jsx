import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, ArrowRight } from "lucide-react";

const FILTERS = ["all", "boy", "girl", "women"];
const PAGE_SIZE = 7;

export const MyDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // slider index per record
  const [activeIndex, setActiveIndex] = useState({});

  useEffect(() => {
    fetchDetails();
  }, []);

  // reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType]);

  const fetchDetails = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("descriptions")
      .select(
        `
        id,
        image_name,
        image_type,
        description_details,
        image_urls (
          image_url
        )
      `
      )
      .order("created_on", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setData(data);
    }

    setLoading(false);
  };

  /* ---------------- FILTER ---------------- */
  const filteredData =
    selectedType === "all"
      ? data
      : data.filter(
          (item) => item.image_type.toLowerCase() === selectedType
        );

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  /* ---------------- SLIDER CONTROLS ---------------- */
  const nextImage = (id, length) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % length,
    }));
  };

  const prevImage = (id, length) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]:
        (prev[id] || 0) === 0 ? length - 1 : prev[id] - 1,
    }));
  };

  if (loading) {
    return (
      <section className="py-32 text-center">
        <p className="text-muted-foreground">Loading details...</p>
      </section>
    );
  }

  return (
    <section id="mydetails" className="py-32 bg-background">
      <div className="container mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="font-serif italic">Creations</span>
          </h2>
          <p className="text-muted-foreground">
            Browse AI-generated visuals by category
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex justify-center gap-4 mb-16 flex-wrap">
          {FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition
                ${
                  selectedType === type
                    ? "bg-primary text-white"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="space-y-24">
          {paginatedData.length === 0 && (
            <p className="text-center text-muted-foreground">
              No content found
            </p>
          )}

          {paginatedData.map((item) => {
            const images = item.image_urls || [];
            const currentIndex = activeIndex[item.id] || 0;

            return (
              <div
                key={item.id}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* IMAGE */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-3xl" />

                  <div className="relative glass rounded-3xl p-2 glow-border">
                    {images.length > 0 ? (
                      <img
                        src={images[currentIndex].image_url}
                        alt={item.image_name}
                        className="w-full aspect-[4/5] object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}

                    {/* SLIDER */}
                    {images.length > 1 && (
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                        <button
                          onClick={() =>
                            prevImage(item.id, images.length)
                          }
                          className="p-2 rounded-full glass hover:text-primary"
                        >
                          <ArrowLeft />
                        </button>
                        <button
                          onClick={() =>
                            nextImage(item.id, images.length)
                          }
                          className="p-2 rounded-full glass hover:text-primary"
                        >
                          <ArrowRight />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* TEXT */}
                <div className="space-y-6">
                  <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {item.image_type}
                  </span>

                  <h3 className="text-3xl font-bold">
                    {item.image_name}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {item.description_details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-20 flex-wrap">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition
                    ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "bg-surface text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
