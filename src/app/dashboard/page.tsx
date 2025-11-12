"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import InvoiceTable from "@/components/InvoiceTable";
import { ClearDataButton } from "@/components/ClearDataButton";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  region: string;
  salesPerson: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  daysOverdue: number;
  agingBucket: string;
}

interface DashboardStats {
  totalInvoices: number;
  totalOutstanding: number;
  overdueInvoices: number;
  regions: string[];
  salesPersons: string[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalOutstanding: 0,
    overdueInvoices: 0,
    regions: [],
    salesPersons: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [tempFilterRegion, setTempFilterRegion] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [tempSortBy, setTempSortBy] = useState("dueDate");
  const [filterSalesPerson, setFilterSalesPerson] = useState("all");
  const [tempFilterSalesPerson, setTempFilterSalesPerson] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Initialize temp values when component mounts
  useEffect(() => {
    setTempSearchTerm(searchTerm);
    setTempFilterRegion(filterRegion);
    setTempSortBy(sortBy);
    setTempFilterSalesPerson(filterSalesPerson);
  }, []);

  const handleApplyFilters = () => {
    setSearchTerm(tempSearchTerm);
    setFilterRegion(tempFilterRegion);
    setSortBy(tempSortBy);
    setFilterSalesPerson(tempFilterSalesPerson);
    setCurrentPage(1);
  };

  // Fetch invoices from server with query params (search, region, sort, pagination)
  const [meta, setMeta] = useState<{ page: number; perPage: number; total: number; totalPages: number }>({
    page: 1,
    perPage: itemsPerPage,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!session?.user) return;

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
  if (searchTerm) params.set("search", searchTerm);
  if (filterRegion && filterRegion !== "all") params.set("region", filterRegion);
  if (filterSalesPerson && filterSalesPerson !== "all") params.set("salesPerson", filterSalesPerson);
  if (sortBy) params.set("sortBy", sortBy);
        params.set("page", String(currentPage));
        params.set("perPage", String(itemsPerPage));

        const response = await fetch(`/api/invoices?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch invoices");
        const data = await response.json();
        setInvoices(data.invoices || []);
        setStats(data.stats || { ...stats });
        setMeta(data.meta || meta);
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, searchTerm, filterRegion, filterSalesPerson, sortBy, currentPage]);

  const totalPages = meta.totalPages || 0;
  const paginatedInvoices = invoices;

  if (status === "loading" || loading) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Dashboard
        </h1>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div className="card">
            <h3 style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              Total Invoices
            </h3>
            <p style={{ fontSize: "1.875rem", fontWeight: "bold" }}>
              {stats.totalInvoices}
            </p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              Total Outstanding
            </h3>
            <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#dc2626" }}>
              ฿{(stats.totalOutstanding || 0).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              Overdue Invoices
            </h3>
            <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#ea9999" }}>
              {stats.overdueInvoices}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>
                Tools
              </label>
              <ClearDataButton />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Search (Invoice #, Customer ID, Name)
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="Search..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Filter by Region
              </label>
              <select
                className="form-input"
                value={tempFilterRegion}
                onChange={(e) => setTempFilterRegion(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                {stats.regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Filter by Sales Person
              </label>
              <select
                className="form-input"
                value={tempFilterSalesPerson}
                onChange={(e) => setTempFilterSalesPerson(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                {stats.salesPersons.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Sort By
              </label>
              <select
                className="form-input"
                value={tempSortBy}
                onChange={(e) => setTempSortBy(e.target.value)}
              >
                <option value="dueDate">Due Date</option>
                <option value="outstanding">Outstanding Amount</option>
                <option value="daysOverdue">Days Overdue</option>
              </select>
            </div>
          </div>

          {/* Apply Button */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleApplyFilters}
              style={{
                padding: "0.625rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
            >
              ✓ ตกลง
            </button>
            <button
              onClick={() => {
                setTempSearchTerm("");
                setTempFilterRegion("all");
                setTempSortBy("dueDate");
                setTempFilterSalesPerson("all");
                setSearchTerm("");
                setFilterRegion("all");
                setSortBy("dueDate");
                setFilterSalesPerson("all");
                setCurrentPage(1);
              }}
              style={{
                padding: "0.625rem 1.5rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
            >
              ↺ รีเซต
            </button>
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceTable invoices={paginatedInvoices} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              marginTop: "2rem",
              padding: "1.5rem",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: currentPage === 1 ? "#d1d5db" : "#3b82f6",
                color: currentPage === 1 ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {/* Show first few pages */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: currentPage === page ? "#3b82f6" : "#ffffff",
                    color: currentPage === page ? "white" : "#1f2937",
                    border: currentPage === page ? "2px solid #3b82f6" : "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: currentPage === page ? "600" : "500",
                    fontSize: "0.875rem",
                    minWidth: "2.5rem",
                  }}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              {/* Show ellipsis if there are more pages */}
              {totalPages > 6 && currentPage > 4 && (
                <span style={{ padding: "0.5rem 0.5rem", color: "#6b7280" }}>…</span>
              )}

              {/* Show middle pages around current page */}
              {totalPages > 6 && currentPage > 4 && currentPage < totalPages - 3 && (
                Array.from({ length: 3 }, (_, i) => currentPage - 1 + i).map((page) => (
                  <button
                    key={page}
                    style={{
                      padding: "0.5rem 0.75rem",
                      backgroundColor: currentPage === page ? "#3b82f6" : "#ffffff",
                      color: currentPage === page ? "white" : "#1f2937",
                      border: currentPage === page ? "2px solid #3b82f6" : "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontWeight: currentPage === page ? "600" : "500",
                      fontSize: "0.875rem",
                      minWidth: "2.5rem",
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))
              )}

              {/* Show ellipsis if there are more pages */}
              {totalPages > 6 && currentPage < totalPages - 3 && (
                <span style={{ padding: "0.5rem 0.5rem", color: "#6b7280" }}>…</span>
              )}

              {/* Show last few pages */}
              {Array.from(
                { length: Math.min(3, totalPages) },
                (_, i) => totalPages - 2 + i
              )
                .filter((page) => page > 3)
                .map((page) => (
                  <button
                    key={page}
                    style={{
                      padding: "0.5rem 0.75rem",
                      backgroundColor: currentPage === page ? "#3b82f6" : "#ffffff",
                      color: currentPage === page ? "white" : "#1f2937",
                      border: currentPage === page ? "2px solid #3b82f6" : "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontWeight: currentPage === page ? "600" : "500",
                      fontSize: "0.875rem",
                      minWidth: "2.5rem",
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
            </div>

            <button
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: currentPage === totalPages ? "#d1d5db" : "#3b82f6",
                color: currentPage === totalPages ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>

            <span
              style={{
                marginLeft: "1rem",
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
