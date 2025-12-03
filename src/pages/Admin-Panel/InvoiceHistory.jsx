// src/components/admin/InvoiceHistory.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  FiRefreshCcw,
  FiSearch,
  FiDownload,
  FiEye,
  FiMail,
  FiPrinter,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const dateFmt = (iso) => {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const moneyFmt = (n, currency = "USD") => {
  if (n == null) return "-";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return String(n);
  }
};

const short = (s = "", n = 80) => (s.length > n ? `${s.slice(0, n)}...` : s);

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showSentOnly, setShowSentOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const url = import.meta.env.VITE_BACKEND_URL;
  const slug = localStorage.getItem("slug");
  const token = localStorage.getItem("token");

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${url}/user/invoice/history`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "x-user-slug": slug,
          "x-slug": slug,
        },
        params: { slug },
      });
      setInvoices(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Unable to load invoice history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return invoices.filter((inv) => {
      if (showSentOnly && !inv.sentViaEmail) return false;
      if (!q) return true;
      return (
        (inv.serial || "").toLowerCase().includes(q) ||
        (inv.contactEmail || "").toLowerCase().includes(q) ||
        (inv.authorizerName || "").toLowerCase().includes(q) ||
        (inv.products || []).some((p) =>
          (p.description || "").toLowerCase().includes(q)
        )
      );
    });
  }, [invoices, search, showSentOnly]);

  const exportCSV = (list = visible) => {
    if (!list || !list.length) return;
    const headers = [
      "Serial",
      "IssueDate",
      "GrandTotal",
      "AuthorizerName",
      "ContactEmail",
      "ContactPhone",
      "Address",
      "SentViaEmail",
      "SentAt",
      "DownloadedAt",
      "CreatedAt",
      "UpdatedAt",
    ];
    const rows = list.map((inv) => [
      inv.serial || "",
      inv.issueDate || "",
      inv.grandTotal ?? "",
      inv.authorizerName || "",
      inv.contactEmail || "",
      inv.contactPhone || "",
      (inv.address || "").replaceAll('"', '""'),
      inv.sentViaEmail ? "Yes" : "No",
      inv.sentAt || "",
      inv.downloadedAt || "",
      inv.createdAt || "",
      inv.updatedAt || "",
    ]);
    const csv =
      [headers, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")
        )
        .join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `invoices_${new Date().toISOString().slice(0, 19)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetails = (inv) => {
    setSelected(inv);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">Invoice History</h3>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by serial, product, authorizer, email..."
              className="pl-9 pr-3 py-2 border rounded w-full sm:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Search invoices"
            />
            <FiSearch className="absolute left-2 top-2.5 text-gray-400" />
          </div>

          <button
            onClick={() => {
              setShowSentOnly((s) => !s);
            }}
            className={`flex items-center gap-2 px-3 py-2 border rounded text-sm  ${
              showSentOnly ? "bg-indigo-600 text-white" : ""
            }`}
            title="Toggle sent only"
            aria-pressed={showSentOnly}
          >
            <FiMail />
            <span className="hidden sm:inline">
              {showSentOnly ? "Sent" : "All"}
            </span>
          </button>

          <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 px-3 py-2 border rounded text-sm hover:bg-gray-50"
            title="Refresh"
            aria-label="Refresh"
          >
            <FiRefreshCcw />
          </button>

          <button
            onClick={() => exportCSV()}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            title="Export CSV"
            aria-label="Export CSV"
          >
            <FiDownload />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-12">
          <ClipLoader size={36} />
        </div>
      ) : error ? (
        <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="py-2 px-3 border-b">Serial</th>
                  <th className="py-2 px-3 border-b">Issue Date</th>
                  <th className="py-2 px-3 border-b text-right">Grand Total</th>
                  <th className="py-2 px-3 border-b">Contact</th>
                  <th className="py-2 px-3 border-b">Address</th>
                  <th className="py-2 px-3 border-b">Sent</th>
                  <th className="py-2 px-3 border-b">Sent At</th>
                  <th className="py-2 px-3 border-b">Downloaded</th>
                  <th className="py-2 px-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  visible.map((inv) => (
                    <tr key={inv._id} className="hover:bg-gray-50 align-top">
                      <td className="py-3 px-3 border-b align-top">
                        <div className="text-sm font-medium">
                          {inv.serial || "-"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {inv.dateStr || ""}
                        </div>
                      </td>
                      <td className="py-3 px-3 border-b text-xs">
                        {dateFmt(inv.issueDate)}
                      </td>
                      <td className="py-3 px-3 border-b text-right font-medium">
                        {moneyFmt(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-3 border-b text-sm">
                        {inv.contactEmail || "-"}
                      </td>
                      <td className="py-3 px-3 border-b text-sm max-w-xs truncate">
                        {inv.address || "-"}
                      </td>
                      <td className="py-3 px-3 border-b">
                        {inv.sentViaEmail ? (
                          <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">
                            Sent
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 border-b text-xs">
                        {dateFmt(inv.sentAt)}
                      </td>
                      <td className="py-3 px-3 border-b text-xs">
                        {dateFmt(inv.downloadedAt)}
                      </td>
                      <td className="py-3 px-3 border-b">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetails(inv)}
                            className="flex items-center gap-2 px-2 py-1 border rounded text-sm hover:bg-gray-50"
                            title="View details"
                          >
                            <FiEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {visible.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                No invoices found.
              </div>
            ) : (
              visible.map((inv) => (
                <motion.article
                  key={inv._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold">
                        {inv.serial || "Invoice"}
                      </h4>
                      <div className="text-xs text-gray-500 mt-1">
                        {dateFmt(inv.issueDate)}
                      </div>
                      <div className="text-sm mt-2">
                        {short(inv.address || "-", 120)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-semibold">
                        {moneyFmt(inv.grandTotal)}
                      </div>
                      <div className="mt-2 flex flex-col gap-2">
                        <button
                          onClick={() => openDetails(inv)}
                          className="p-2 border rounded text-sm hover:bg-gray-50"
                          aria-label="View details"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Showing <strong>{visible.length}</strong> of{" "}
            <strong>{invoices.length}</strong> records.
          </div>
        </>
      )}

      {/* Details modal */}
      <AnimatePresence>
        {modalOpen && selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full z-50 p-6 max-h-[90vh] overflow-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">
                    Invoice {selected.serial}
                  </h4>
                  <div className="text-xs text-gray-500 mt-1">
                    Issued: {selected.dateStr || dateFmt(selected.issueDate)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportCSV([selected])}
                    className="flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50"
                    title="Export single invoice"
                  >
                    <FiDownload /> Export
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50"
                    title="Print"
                  >
                    <FiPrinter /> Print
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Products */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600">
                    Products
                  </h5>
                  <div className="mt-2 space-y-2">
                    {(selected.products || []).map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center border rounded p-3"
                      >
                        <div>
                          <div className="font-medium">{p.description}</div>
                          <div className="text-xs text-gray-500">
                            {(p.quantity ?? 1) + " × " + moneyFmt(p.unitPrice)}
                          </div>
                        </div>
                        <div className="font-semibold">
                          {moneyFmt(p.total ?? p.unitPrice * (p.quantity ?? 1))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-600">Summary</h5>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Grand Total</span>
                      <span>{moneyFmt(selected.grandTotal)}</span>
                    </div>
                    {selected.authorizerName && (
                      <div className="flex justify-between">
                        <span>Authorizer</span>
                        <span>{selected.authorizerName}</span>
                      </div>
                    )}
                    {selected.contactEmail && (
                      <div className="flex justify-between">
                        <span>Contact</span>
                        <span>{selected.contactEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Address</span>
                      <span className="text-right">
                        {selected.address || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sent</span>
                      <span>
                        {selected.sentViaEmail
                          ? `Yes • ${dateFmt(selected.sentAt)}`
                          : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downloaded</span>
                      <span>
                        {selected.downloadedAt
                          ? dateFmt(selected.downloadedAt)
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => {
                        if (selected.serial)
                          navigator.clipboard?.writeText(selected.serial);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                      Copy Serial
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceHistory;
