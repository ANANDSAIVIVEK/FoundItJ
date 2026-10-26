
import { useEffect, useMemo, useState } from "react";
import {
  Search, Menu, ArrowUpRight, MapPin, CalendarDays,
  Plus, PackageSearch, Heart, X, LoaderCircle
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";

const sampleItems = [
  {
    id: 1,
    title: "Wireless earbuds",
    category: "Electronics",
    location: "Library",
    reportType: "LOST",
    status: "OPEN",
    description: "Black wireless earbuds in a charging case.",
    itemDate: "2026-10-25",
  },
  {
    id: 2,
    title: "Set of keys",
    category: "Accessories",
    location: "Canteen",
    reportType: "FOUND",
    status: "OPEN",
    description: "A set of keys with a small keychain.",
    itemDate: "2026-10-24",
  },
  {
    id: 3,
    title: "Blue backpack",
    category: "Bags",
    location: "Main building",
    reportType: "LOST",
    status: "OPEN",
    description: "Blue backpack left near the main building.",
    itemDate: "2026-10-23",
  },
  {
    id: 4,
    title: "Notebook",
    category: "Books",
    location: "Classroom",
    reportType: "FOUND",
    status: "OPEN",
    description: "Notebook found in a classroom.",
    itemDate: "2026-10-22",
  },
];

const categories = [
  "All items",
  "Electronics",
  "Bags",
  "Books",
  "Accessories",
];

function App() {

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Electronics",
    location: "",
    itemDate: "",
    reportType: "LOST",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function submitReport(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(`${API}/reports/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Could not save report (${response.status})`);
      }

      const savedReport = await response.json();

      setItems((previous) => [
        savedReport,
        ...previous.filter((item) => item.id !== savedReport.id),
      ]);

      setReportOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "Electronics",
        location: "",
        itemDate: "",
        reportType: "LOST",
      });
    } catch (error) {
      setFormError(
        `${error.message}. Check that Spring Boot is running and CORS is configured.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      try {
        // Adjust this endpoint to match your Spring Boot controller.
        const response = await fetch(`${API}/reports/get`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        setItems(Array.isArray(data) ? data : data.content ?? []);
        setApiMessage("");
      } catch (error) {
        if (error.name === "AbortError") return;
        setItems(sampleItems);
        setApiMessage("Showing sample reports while the API is unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadItems();
    return () => controller.abort();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = [
        item.title,
        item.description,
        item.category,
        item.location,
      ].filter(Boolean).join(" ").toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory =
        category === "All items" ||
        (item.category || "").toLowerCase() === category.toLowerCase();
      const matchesType =
        type === "ALL" || item.reportType === type;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [items, search, category, type]);

  function scrollToReports() {
    document.getElementById("reports")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#183C32]">
      <header className="sticky top-0 z-20 border-b border-[#E5E5DC] bg-[#F8F7F2]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <PackageSearch size={28} strokeWidth={1.8} />
            foundit<span className="text-[#79A28A]">.</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#reports" className="text-sm text-[#60675F] hover:text-[#183C32]">
              Browse items
            </a>
            <a href="#how-it-works" className="text-sm text-[#60675F] hover:text-[#183C32]">
              How it works
            </a>
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#183C32] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#285443]"
            >
              <Plus size={17} /> Report an item
            </button>
          </div>

          <button
            className="rounded-lg p-2 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </nav>

        {mobileMenu && (
          <div className="flex flex-col gap-4 border-t border-[#E5E5DC] px-5 py-4 md:hidden">
            <a href="#reports" onClick={() => setMobileMenu(false)}>Browse items</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
            <button
              onClick={() => {
                setMobileMenu(false);
                setReportOpen(true);
              }}
              className="rounded-lg bg-[#183C32] p-3 text-white"
            >
              Report an item
            </button>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DCE4D9] bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-[#477A60]">
              <span className="h-2 w-2 rounded-full bg-[#79A28A]" />
              A little help goes a long way
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Every lost thing deserves a{" "}
              <span className="font-serif italic font-normal text-[#668B70]">
                way home.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#72766D] sm:text-lg">
              Lost something important? Found something that belongs to
              someone else? Let's help bring them back together.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-3 rounded-lg bg-[#183C32] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#285443]"
              >
                Report an item <ArrowUpRight size={17} />
              </button>
              <button
                onClick={scrollToReports}
                className="rounded-lg border border-[#D5D8CF] px-6 py-4 text-sm font-medium transition hover:bg-white"
              >
                Browse reports
              </button>
            </div>

            <div className="mt-12 flex items-center gap-3 text-sm text-[#72766D]">
              <Heart size={17} strokeWidth={1.6} />
              Small acts of kindness make a difference.
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-3 -top-4 h-28 w-28 rounded-full bg-[#E4E8DA]" />
            <div className="relative rounded-2xl border border-[#E6E5DC] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-[#ECECE5] pb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#888C82]">
                    Community board
                  </p>
                  <h2 className="mt-1 text-lg font-medium">Recent activity</h2>
                </div>
                <PackageSearch size={24} className="text-[#668B70]" />
              </div>

              <div className="mt-4 space-y-3">
                {sampleItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-xl bg-[#F8F7F2] p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E6E9E0] text-[#477A60]">
                      <PackageSearch size={22} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#888C82]">
                        <MapPin size={12} /> {item.location}
                      </p>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-[10px] font-semibold tracking-wide ${item.reportType === "LOST"
                      ? "bg-[#F5E8D5] text-[#916528]"
                      : "bg-[#E0EADF] text-[#477A60]"
                      }`}>
                      {item.reportType}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={scrollToReports}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E5DC] py-3 text-sm font-medium hover:bg-[#F8F7F2]"
              >
                Explore reports <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <section id="reports" className="scroll-mt-24 border-t border-[#E7E6DE] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#668B70]">
                  The community board
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Recently reported
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#777B72]">
                  A second look could help someone find what they're missing.
                </p>
              </div>

              <button
                onClick={() => setReportOpen(true)}
                className="flex w-fit items-center gap-2 text-sm font-medium text-[#477A60] hover:text-[#183C32]"
              >
                Add a report <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-[#E3E4DC] bg-[#F8F7F2] px-4 py-3 focus-within:border-[#668B70]">
                <Search size={19} className="shrink-0 text-[#858A80]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items, categories or locations..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#96998F]"
                  aria-label="Search reports"
                />
              </div>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-lg border border-[#E3E4DC] bg-[#F8F7F2] px-4 py-3 text-sm outline-none"
                aria-label="Filter report type"
              >
                <option value="ALL">Lost & found</option>
                <option value="LOST">Lost only</option>
                <option value="FOUND">Found only</option>
              </select>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {categories.map((name) => (
                <button
                  key={name}
                  onClick={() => setCategory(name)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${category === name
                    ? "border-[#183C32] bg-[#183C32] text-white"
                    : "border-[#E2E3DA] bg-white text-[#6E746B] hover:border-[#9DAF9F]"
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {apiMessage && (
              <p className="mt-5 rounded-lg bg-[#F8F7F2] p-3 text-sm text-[#777B72]">
                {apiMessage}
              </p>
            )}

            {loading ? (
              <div className="flex justify-center py-20 text-[#668B70]">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 text-center">
                <PackageSearch className="mx-auto text-[#A4AA9E]" size={36} />
                <h3 className="mt-4 text-lg font-medium">No reports found</h3>
                <p className="mt-2 text-sm text-[#777B72]">
                  Try another search or category.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-[#E7E6DE] bg-white transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-40 items-center justify-center bg-[#F1F1E9]">
                      <PackageSearch
                        size={42}
                        strokeWidth={1.1}
                        className="text-[#A0AD9D] transition group-hover:scale-105"
                      />
                      <span className={`absolute ml-24 -mt-24 rounded-md px-2 py-1 text-[10px] font-semibold ${item.reportType === "LOST"
                        ? "bg-[#F5E8D5] text-[#916528]"
                        : "bg-[#E0EADF] text-[#477A60]"
                        }`}>
                        {item.reportType || "REPORTED"}
                      </span>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-[#8A8E83]">
                        {item.category || "Other"}
                      </p>
                      <h3 className="mt-2 font-medium">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#777B72]">
                        {item.description || "No description provided."}
                      </p>
                      <div className="mt-4 flex items-center gap-1.5 text-xs text-[#777B72]">
                        <MapPin size={14} /> {item.location || "Location not specified"}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#777B72]">
                        <CalendarDays size={14} /> {item.itemDate || "Date not specified"}
                      </div>
                      <button
                        onClick={() => alert(
                          `Report #${item.id}\n${item.title}\nStatus: ${item.status || "OPEN"}`
                        )}
                        className="mt-5 flex w-full items-center justify-between border-t border-[#EEEEEA] pt-4 text-sm font-medium hover:text-[#668B70]"
                      >
                        View details <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#668B70]">
            Simple by design
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Three steps. One less worry.
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              ["01", "Report an item", "Tell the community what you lost or found."],
              ["02", "Find a match", "Search reports and check relevant details."],
              ["03", "Reconnect", "Use the claim process to help reunite an item with its owner."],
            ].map(([number, title, description]) => (
              <div key={number} className="border-t border-[#D9DCD2] pt-5">
                <span className="text-sm text-[#668B70]">{number}</span>
                <h3 className="mt-4 text-xl font-medium">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#777B72]">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E5DC] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#777B72] sm:flex-row">
          <span className="font-semibold text-[#183C32]">foundit.</span>
          <span>A little kindness can bring things home.</span>
        </div>
      </footer>


      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#14271F]/50 p-4">
          <form
            onSubmit={submitReport}
            className="my-auto w-full max-w-lg space-y-5 rounded-2xl bg-[#F8F7F2] p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#668B70]">
                  Community board
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Report an item
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setReportOpen(false)}
                aria-label="Close form"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["LOST", "FOUND"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      reportType: value,
                    }))
                  }
                  className={`rounded-lg border p-3 text-sm font-medium ${formData.reportType === value
                      ? "border-[#183C32] bg-[#183C32] text-white"
                      : "border-[#D5D8CF] bg-white text-[#183C32]"
                    }`}
                >
                  {value === "LOST"
                    ? "I lost something"
                    : "I found something"}
                </button>
              ))}
            </div>

            <label className="block space-y-2 text-sm">
              Item name
              <input
                required
                maxLength={255}
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                placeholder="e.g. Black backpack"
                className="w-full rounded-lg border border-[#D5D8CF] bg-white px-4 py-3 outline-none focus:border-[#668B70]"
              />
            </label>

            <label className="block space-y-2 text-sm">
              Category
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-[#D5D8CF] bg-white px-4 py-3 outline-none"
              >
                {[
                  "Electronics",
                  "Bags",
                  "Books",
                  "Accessories",
                  "Documents",
                  "Clothing",
                  "Other",
                ].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm">
              Description
              <textarea
                required
                maxLength={1000}
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the item so its owner can identify it."
                className="w-full resize-y rounded-lg border border-[#D5D8CF] bg-white px-4 py-3 outline-none focus:border-[#668B70]"
              />
            </label>

            <label className="block space-y-2 text-sm">
              Location
              <input
                required
                maxLength={255}
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                placeholder="Where was it lost or found?"
                className="w-full rounded-lg border border-[#D5D8CF] bg-white px-4 py-3 outline-none focus:border-[#668B70]"
              />
            </label>

            <label className="block space-y-2 text-sm">
              Date lost or found
              <input
                type="date"
                required
                max={new Date().toLocaleDateString("en-CA")}
                value={formData.itemDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    itemDate: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-[#D5D8CF] bg-white px-4 py-3 outline-none"
              />
            </label>

            {formError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#183C32] px-5 py-4 text-sm font-medium text-white transition hover:bg-[#285443] disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default App;
