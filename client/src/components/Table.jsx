// components/Table.jsx
const Table = ({ columns, data }) => (
  <table className="w-full border mt-4">
    <thead>
      <tr className="bg-gray-200">
        {columns.map((col) => <th key={col} className="p-2 text-left">{col}</th>)}
      </tr>
    </thead>
    <tbody>
      {data.map((row, idx) => (
        <tr key={idx} className="border-t">
          {columns.map((col) => <td key={col} className="p-2">{row[col]}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);
