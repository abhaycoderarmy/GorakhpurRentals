import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/analytics`)
      .then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  const chartData = [
    { name: "Users", value: data.totalUsers },
    { name: "Orders", value: data.totalOrders },
    { name: "Revenue", value: data.totalRevenue },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Analytics</h1>
      <p className="mb-4">Most Popular Lehenga: <strong>{data.mostPopularProduct}</strong></p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
