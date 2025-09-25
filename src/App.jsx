import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  PencilSimple,
  Trash,
  X,
  MagnifyingGlass,
  Funnel,
  ArrowCounterClockwise,
  CaretUpDown,
} from "@phosphor-icons/react";

// === Drive Brand Colors ===
const DRIVE_BRAND_COLORS = {
  LL: { bg: "#FFC300", text: "#000000", link: "#FFC300" },
  SB: { bg: "#D70000", text: "#FFFFFF", link: "#D70000" },
  ST: { bg: "#FF4400", text: "#000000", link: "#FF4400" },
  TB: { bg: "#0022FF", text: "#FFFFFF", link: "#0022FF" },
  CB: { bg: "#009428", text: "#FFFFFF", link: "#009428" },
  CBSB: { bg: "#948300", text: "#FFFFFF", link: "#948300" },
  HAN: { bg: "#FFA600", text: "#000000", link: "#FFA600" },
  NON: { bg: "#575753", text: "#FFFFFF", link: "#FFFFFF" },
};

// === Status Maps ===
const DESIGN_STATUS = {
  Hold: { bg: "#333333", text: "#FFFFFF" },
  Working: { bg: "#00433C", text: "#00ECFD" },
  Pending: { bg: "#3C1D08", text: "#FFA600" },
  Canceled: { bg: "#460000", text: "#FF0000" },
  Done: { bg: "#082C14", text: "#00FF7B" },
};
const SUBMISSION_STATUS = {
  Pending: { bg: "#3C1D08", text: "#FFA600" },
  Hold: { bg: "#333333", text: "#FFFFFF" },
  Done: { bg: "#082C14", text: "#00FF7B" },
};
const BOQ_STATUS = { ...SUBMISSION_STATUS };
const QUOTATION_STATUS = { ...SUBMISSION_STATUS };
const APPROVAL_STATUS = {
  Approved: { bg: "#082C14", text: "#00FF7B" },
  Pending: { bg: "#3C1D08", text: "#FFA600" },
};

// === Dropdown Pill with outside click ===
function DropdownPill({ current, options, colorMap, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const colors = colorMap[current] || { bg: "#333", text: "#fff" };

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <span
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 hover:opacity-80"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {current}
      </span>

      {open && (
        <div className="absolute mt-1 left-0 z-30 bg-[#1E1E1E] rounded-lg shadow-lg border border-white/20">
          {Object.keys(options).map((key) => {
            const opt = options[key];
            return (
              <div
                key={key}
                onClick={() => {
                  setOpen(false);
                  onChange(key);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-white/10 text-sm transition-colors duration-200"
              >
                <span
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: opt.bg, color: opt.text }}
                >
                  {key}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    design: "",
    submission: "",
    boq: "",
    quotation: "",
    approval: "",
  });
  const [showFilter, setShowFilter] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newOutlet, setNewOutlet] = useState({ rt_code: "", outlet_name: "" });
  const [editOutlet, setEditOutlet] = useState(null);

  // Load data
  useEffect(() => {
    loadOutlets();
  }, []);

  async function loadOutlets() {
    setLoading(true);
    const { data } = await supabase
      .from("outlets")
      .select(
        "id, rt_code, outlet_name, design_status, design_submission, design_boq, design_quotation, drive_brand, approval_status, created_at"
      )
      .order("created_at", { ascending: false });
    setOutlets(data || []);
    setLoading(false);
  }

  async function addOutlet() {
    if (!newOutlet.rt_code || !newOutlet.outlet_name) return;
    await supabase.from("outlets").insert([newOutlet]);
    setShowAdd(false);
    setNewOutlet({ rt_code: "", outlet_name: "" });
    loadOutlets();
  }

  async function updateOutlet() {
    if (!editOutlet) return;
    await supabase
      .from("outlets")
      .update({
        rt_code: editOutlet.rt_code,
        outlet_name: editOutlet.outlet_name,
      })
      .eq("id", editOutlet.id);
    setEditOutlet(null);
    loadOutlets();
  }

  async function updateField(id, field, value) {
    await supabase.from("outlets").update({ [field]: value }).eq("id", id);
    loadOutlets();
  }

  async function deleteOutlet(id) {
    if (!window.confirm("Delete this outlet?")) return;
    await supabase.from("outlets").delete().eq("id", id);
    loadOutlets();
  }

  function resetFilters() {
    setFilters({
      brand: "",
      design: "",
      submission: "",
      boq: "",
      quotation: "",
      approval: "",
    });
  }

  const filtered = outlets.filter((o) => {
    const matchesSearch =
      o.rt_code.toLowerCase().includes(search.toLowerCase()) ||
      o.outlet_name.toLowerCase().includes(search.toLowerCase());

    return (
      matchesSearch &&
      (!filters.brand || o.drive_brand === filters.brand) &&
      (!filters.design || o.design_status === filters.design) &&
      (!filters.submission || o.design_submission === filters.submission) &&
      (!filters.boq || o.design_boq === filters.boq) &&
      (!filters.quotation || o.design_quotation === filters.quotation) &&
      (!filters.approval || o.approval_status === filters.approval)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  function toggleSort(key) {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  return (
    <div className="min-h-screen bg-[#10151F] text-white font-inter pt-6 pb-2">
      <div className="max-w-8xl mx-auto px-35 text-sm sm:text-base md:text-lg">
        <h1 className="flex items-center text-5xl font-bold mb-6">
          <img src="/DesignFLow.svg" alt="DesignFlow Logo" className="h-12 mr-4" />
          <span>DesignFlow</span>
        </h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            ["Total Outlets", outlets.length],
            ["Pending Designs", outlets.filter((o) => o.design_status === "Pending").length],
            ["Pending Submissions", outlets.filter((o) => o.design_submission === "Pending").length],
            ["Pending BOQ", outlets.filter((o) => o.design_boq === "Pending").length],
            ["Pending Quotations", outlets.filter((o) => o.design_quotation === "Pending").length],
            ["Pending Approvals", outlets.filter((o) => o.approval_status === "Pending").length],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-[#182028] rounded-xl p-2 text-left hover:bg-[#243040] transition-colors duration-200 cursor-pointer"
            >
              <div className="text-m text-white">{label}</div>
              <div className="text-5xl font-m ">{value}</div>
            </div>
          ))}
        </div>

        {/* Top Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={() => setShowAdd(true)}
            className="px-8 py-2 rounded-xl bg-white text-[#1E1E1E] font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-200"
          >
            Add Outlet
          </button>

          {/* Search */}
          <div className="flex-1 flex items-center bg-white/50 rounded-xl px-4 min-w-[200px]">
            <MagnifyingGlass size={20} color="white" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by RT Code or Outlet Name"
              className="flex-1 bg-transparent text-white px-2 py-2 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="cursor-pointer">
                <X size={20} color="white" />
              </button>
            )}
          </div>

          {/* Filter & Reset */}
          <button
            onClick={() => setShowFilter(true)}
            className="px-8 py-2 rounded-xl bg-white/75 text-[#1E1E1E] flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-white"
          >
            <Funnel size={18} /> Filter
          </button>
          <button
            onClick={resetFilters}
            className="px-8 py-2 rounded-xl bg-red-500 text-white flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-red-600"
          >
            <ArrowCounterClockwise size={18} /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl p-4 text-sm md:text-base">
          <div className="overflow-x-auto table-scroll">
            <div className="sm:scale-100 scale-90 origin-top-left">
              <div className="overflow-y-auto min-h-[40vh] max-h-[65vh] table-scroll px-3">
                
                
                <table className="w-full table-auto border-separate border-spacing-y-3 bg-transparent">
                  {/* Sticky header */}
                  <thead className="sticky top-0 z-50 bg-[#10151F]">
                    <tr className="text-left text-sm md:text-base">
                      <th
                        className="relative pb-4 px-8 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("rt_code")}
                      >
                        <div className="flex items-center gap-1">
                          <span>RT Code</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th
                        className="relative pb-4 px-3 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("outlet_name")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Outlet Name</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th
                        className="relative pb-4 px-3 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("drive_brand")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Drive Brand</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th
                        className="relative pb-4 px-3 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("design_status")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Design Status</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th
                        className="relative pb-4 px-3 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("design_submission")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Submission</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th
                        className="relative pb-4 px-3 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("design_boq")}
                      >
                        <div className="flex items-center gap-1">
                          <span>BOQ</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th
                        className="relative pb-4 px-3 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("design_quotation")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Quotation</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th
                        className="relative pb-4 px-3 cursor-pointer hover:text-blue-400 transition-colors border-b border-white"
                        onClick={() => toggleSort("approval_status")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Approval</span>
                          <CaretUpDown size={18} style={{ transform: "scaleX(1.2)" }} />
                        </div>
                      </th>
                      <th className="relative pb-4 px-3 pr-1 border-b border-white">Actions</th>
                    </tr>
                  </thead>




                  {/* Body */}
                  <tbody className="border-separate border-spacing-y-3">
                    {!loading &&
                      sorted.map((o) => {
                        const brand =
                          DRIVE_BRAND_COLORS[o.drive_brand] || DRIVE_BRAND_COLORS.NON;

                        return (
                          <tr
                            key={o.id}
                            className="group cursor-pointer text-sm md:text-base"
                          >
                            {/* RT Code */}
                            <td className="p-0">
                              <div
                                className="px-8 py-3 min-h-[48px] h-full flex items-center rounded-l-2xl bg-[#182028] group-hover:bg-[#243040] transition-colors truncate"
                                style={{ color: brand.link }}
                              >
                                {o.rt_code}
                              </div>
                            </td>

                            {/* Outlet Name */}
                            <td className="p-0">
                              <div
                                className="px-3 py-3 min-h-[48px] h-full flex items-center bg-[#182028] group-hover:bg-[#243040] transition-colors truncate"
                                style={{ color: brand.link }}
                              >
                                {o.outlet_name}
                              </div>
                            </td>

                            {/* Drive Brand */}
                            <td className="p-0">
                              <div className="px-3 py-3 min-h-[48px] h-full flex items-center bg-[#182028] group-hover:bg-[#243040] transition-colors">
                                <DropdownPill
                                  current={o.drive_brand}
                                  options={DRIVE_BRAND_COLORS}
                                  colorMap={DRIVE_BRAND_COLORS}
                                  onChange={(val) =>
                                    updateField(o.id, "drive_brand", val)
                                  }
                                />
                              </div>
                            </td>

                            {/* Design Status */}
                            <td className="p-0">
                              <div className="px-3 py-3 min-h-[48px] h-full flex items-center bg-[#182028] group-hover:bg-[#243040] transition-colors">
                                <DropdownPill
                                  current={o.design_status}
                                  options={DESIGN_STATUS}
                                  colorMap={DESIGN_STATUS}
                                  onChange={(val) =>
                                    updateField(o.id, "design_status", val)
                                  }
                                />
                              </div>
                            </td>

                            {/* Submission */}
                            <td className="p-0">
                              <div className="px-3 py-3 min-h-[48px] h-full flex items-center bg-[#182028] group-hover:bg-[#243040] transition-colors">
                                <DropdownPill
                                  current={o.design_submission}
                                  options={SUBMISSION_STATUS}
                                  colorMap={SUBMISSION_STATUS}
                                  onChange={(val) =>
                                    updateField(o.id, "design_submission", val)
                                  }
                                />
                              </div>
                            </td>

                            {/* BOQ */}
                            <td className="p-0">
                              <div className="px-3 py-3 min-h-[48px] h-full flex items-center bg-[#182028] group-hover:bg-[#243040] transition-colors">
                                <DropdownPill
                                  current={o.design_boq}
                                  options={BOQ_STATUS}
                                  colorMap={BOQ_STATUS}
                                  onChange={(val) =>
                                    updateField(o.id, "design_boq", val)
                                  }
                                />
                              </div>
                            </td>

                            {/* Quotation */}
                            <td className="p-0">
                              <div className="px-3 py-3 min-h-[48px] h-full flex items-center bg-[#182028] group-hover:bg-[#243040] transition-colors">
                                <DropdownPill
                                  current={o.design_quotation}
                                  options={QUOTATION_STATUS}
                                  colorMap={QUOTATION_STATUS}
                                  onChange={(val) =>
                                    updateField(o.id, "design_quotation", val)
                                  }
                                />
                              </div>
                            </td>

                            {/* Approval */}
                            <td className="p-0">
                              <div className="px-3 py-3 min-h-[48px] h-full flex items-center bg-[#182028] group-hover:bg-[#243040] transition-colors">
                                <DropdownPill
                                  current={o.approval_status}
                                  options={APPROVAL_STATUS}
                                  colorMap={APPROVAL_STATUS}
                                  onChange={(val) =>
                                    updateField(o.id, "approval_status", val)
                                  }
                                />
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-0">
                              <div className="pl-3 pr-2 py-3 min-h-[48px] h-full w-full flex items-center justify-start gap-3 rounded-r-2xl bg-[#182028] group-hover:bg-[#243040] transition-colors">
                                <button
                                  onClick={() => setEditOutlet(o)}
                                  className="cursor-pointer hover:scale-110 transition-transform"
                                >
                                  <PencilSimple size={20} color="#FFFFFF" />
                                </button>
                                <button
                                  onClick={() => deleteOutlet(o.id)}
                                  className="cursor-pointer hover:scale-110 transition-transform"
                                >
                                  <Trash size={20} color="#FFFFFF" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>



        {/* Filter, Add, Edit Modals (with hover & cursor) */}
        {showFilter && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/60"
            onClick={() => setShowFilter(false)}
          >
            <div
              className="bg-[#182028] p-6 rounded-xl w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Filter Outlets</h2>

              {/* Filter fields */}
              {[
                { key: "brand", label: "Drive Brand", options: Object.keys(DRIVE_BRAND_COLORS) },
                { key: "design", label: "Design Status", options: Object.keys(DESIGN_STATUS) },
                { key: "submission", label: "Submission", options: Object.keys(SUBMISSION_STATUS) },
                { key: "boq", label: "BOQ", options: Object.keys(BOQ_STATUS) },
                { key: "quotation", label: "Quotation", options: Object.keys(QUOTATION_STATUS) },
                { key: "approval", label: "Approval", options: Object.keys(APPROVAL_STATUS) },
              ].map((f) => (
                <div key={f.key} className="mb-4">
                  <label className="block mb-1">{f.label}</label>
                  <select
                    value={filters[f.key]}
                    onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1E1E1E] border border-white/20 text-white cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <option value="">All</option>
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowFilter(false)}
                  className="px-4 py-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-600 rounded cursor-pointer hover:bg-red-500"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}


        {showAdd && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/60"
            onClick={() => setShowAdd(false)}
          >
            <div
              className="bg-[#182028] p-6 rounded-xl w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add Outlet</h2>
              <input
                className="w-full mb-3 px-3 py-2 rounded bg-white/10 text-white"
                placeholder="RT Code"
                value={newOutlet.rt_code}
                onChange={(e) => setNewOutlet({ ...newOutlet, rt_code: e.target.value })}
              />
              <input
                className="w-full mb-3 px-3 py-2 rounded bg-white/10 text-white"
                placeholder="Outlet Name"
                value={newOutlet.outlet_name}
                onChange={(e) => setNewOutlet({ ...newOutlet, outlet_name: e.target.value })}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={addOutlet}
                  className="px-4 py-2 bg-blue-600 rounded cursor-pointer hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {editOutlet && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/60"
            onClick={() => setEditOutlet(null)}
          >
            <div
              className="bg-[#182028] p-6 rounded-xl w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Edit Outlet</h2>
              <input
                className="w-full mb-3 px-3 py-2 rounded bg-white/10 text-white"
                value={editOutlet.rt_code}
                onChange={(e) => setEditOutlet({ ...editOutlet, rt_code: e.target.value })}
              />
              <input
                className="w-full mb-3 px-3 py-2 rounded bg-white/10 text-white"
                value={editOutlet.outlet_name}
                onChange={(e) => setEditOutlet({ ...editOutlet, outlet_name: e.target.value })}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditOutlet(null)}
                  className="px-4 py-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={updateOutlet}
                  className="px-4 py-2 bg-blue-600 rounded cursor-pointer hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
