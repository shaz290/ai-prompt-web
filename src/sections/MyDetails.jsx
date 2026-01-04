import {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiOpenai, SiGoogle, SiPerplexity } from "react-icons/si";

const PAGE_SIZE = 4;
const SWIPE_THRESHOLD = 50;

/* ---------- SHARE PARAM ---------- */
const getShareIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("share");
};

export const MyDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [sharedId, setSharedId] = useState(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const cardRefs = useRef({});
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    const id = getShareIdFromUrl();
    if (id) setSharedId(id);

    checkAuth();
    fetchDetails();
  }, []);

  /* ---------- AUTH CHECK ---------- */
  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setIsAdmin(false);
      setCheckingAuth(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
    setCheckingAuth(false);
  };

  /* ---------- FETCH ---------- */
  const fetchDetails = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("descriptions")
      .select(`
        id,
        description_details,
        image_urls ( image_url )
      `)
      .order("created_on", { ascending: false });

    if (!error) setData(data);
    else console.error(error);

    setLoading(false);
  };

  /* ---------- INSTANT SCROLL FOR SHARE ---------- */
  useLayoutEffect(() => {
    if (sharedId && !loading && cardRefs.current[sharedId]) {
      const navbar = document.querySelector("header");
      const navbarHeight = navbar?.offsetHeight || 80;

      const top =
        cardRefs.current[sharedId].getBoundingClientRect().top +
        window.scrollY;

      window.scrollTo({
        top: top - navbarHeight - 16,
        behavior: "auto",
      });
    }
  }, [sharedId, loading]);

  /* ---------- ACCESS CONTROL ---------- */
  if (!checkingAuth && !isAdmin && !sharedId) {
    return (
      <section className="py-32 text-center">
        <h2 className="text-2xl font-bold">Access Restricted 🔒</h2>
        <p className="text-muted-foreground mt-2">
          You can only view shared links.
        </p>
      </section>
    );
  }

  /* ---------- FILTER DATA ---------- */
  const filteredData = sharedId
    ? data.filter((item) => item.id.toString() === sharedId)
    : data;

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = sharedId || !isAdmin
    ? filteredData
    : filteredData.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      );

  /* ---------- SLIDER ---------- */
  const nextImage = (id, length) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % length,
    }));
  };

  const prevImage = (id, length) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? length - 1 : prev[id] - 1,
    }));
  };

  /* ---------- SWIPE ---------- */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (id, length) => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    delta > 0 ? nextImage(id, length) : prevImage(id, length);
  };

  /* ---------- TOAST ---------- */
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 1500);
  };

  /* ---------- ACTIONS ---------- */
  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

  const handleShare = async (id) => {
    const url = `${window.location.origin}?share=${id}`;
    await navigator.clipboard.writeText(url);
    showToast("Sharable link copied");
  };

  const openWithChatGPT = (text) => {
    window.open("https://chat.openai.com/", "_blank");
  };

  const openWithGemini = (text) => {
    window.open(
      `https://gemini.google.com/app?q=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const openWithPerplexity = (text) => {
    window.open(
      `https://www.perplexity.ai/?q=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <section className="py-32 text-center">
        <p>Loading details...</p>
      </section>
    );
  }

  return (
    <section id="mydetails" className="py-32">
      <div className="container mx-auto px-6">

        {/* ✅ HEADER ADDED BACK */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="font-serif italic">Creations</span>
          </h2>
          <p className="text-muted-foreground">
            Browse AI-generated visuals
          </p>
        </div>


        {/* TOAST */}
        {toastMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="px-6 py-3 bg-black text-white rounded-xl">
              {toastMessage}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
          {paginatedData.map((item) => {
            const images = item.image_urls || [];
            const index = activeIndex[item.id] || 0;

            return (
              <div
                key={item.id}
                ref={(el) => (cardRefs.current[item.id] = el)}
                className="space-y-4"
              >
                <div
                  className="relative"
                  onTouchStart={images.length > 1 ? handleTouchStart : undefined}
                  onTouchMove={images.length > 1 ? handleTouchMove : undefined}
                  onTouchEnd={
                    images.length > 1
                      ? () => handleTouchEnd(item.id, images.length)
                      : undefined
                  }
                >
                  <img
                    src={images[index]?.image_url}
                    className="w-full aspect-[4/5] object-cover rounded-2xl"
                  />

                  {images.length > 1 && (
                    <div className="absolute inset-y-0 left-0 right-0 flex justify-between px-3 items-center">
                      <button onClick={() => prevImage(item.id, images.length)}>
                        <ArrowLeft />
                      </button>
                      <button onClick={() => nextImage(item.id, images.length)}>
                        <ArrowRight />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {item.description_details}
                </p>

                <button
                  onClick={() => handleCopy(item.description_details)}
                  className="w-full py-2 bg-primary text-white rounded-xl"
                >
                  Copy
                </button>

                {/* ❌ SHARE ONLY FOR ADMIN */}
                {isAdmin && (
                  <button
                    onClick={() => handleShare(item.id)}
                    className="w-full py-2 border rounded-xl"
                  >
                    Share Link
                  </button>
                )}

                <div className="flex justify-center gap-6 pt-2">
                  <SiGoogle onClick={() => openWithGemini(item.description_details)} />
                  <SiOpenai onClick={() => openWithChatGPT(item.description_details)} />
                  <SiPerplexity onClick={() => openWithPerplexity(item.description_details)} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ❌ PAGINATION ONLY FOR ADMIN */}
        {isAdmin && !sharedId && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-16">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  currentPage === i + 1
                    ? "bg-primary text-white"
                    : "bg-surface text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
