import { useState } from "react";
import { fetchTransactionsByConsentId } from "../api";

export function useTransactionsByConsentId() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const [rawResponse, setRawResponse] = useState(null);
  const fetchTransactions = async (consentId, page = 1, pageSize = 10) => {
    if (!consentId) {
      setError("Please enter a consent ID");
      setTransactions([]);
      setAllTransactions([]);
      setTotal(0);
      setRawResponse(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchTransactionsByConsentId(consentId);
      setRawResponse(data);
      const txs = Array.isArray(data) ? data : (data.transactions || []);
      setAllTransactions(txs);
      setTotal(txs.length);
      // Paginate on frontend
      const start = (page - 1) * pageSize;
      setTransactions(txs.slice(start, start + pageSize));
      setError(null);
    } catch {
      setError("Failed to load transactions");
      setTransactions([]);
      setAllTransactions([]);
      setTotal(0);
      setRawResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // For manual pagination in the component
  const paginate = (page, pageSize) => {
    const start = (page - 1) * pageSize;
    setTransactions(allTransactions.slice(start, start + pageSize));
  };

  return { transactions, allTransactions, loading, error, fetchTransactions, total, paginate, rawResponse };
}
