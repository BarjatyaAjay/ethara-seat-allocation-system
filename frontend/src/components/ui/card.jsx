const Card = ({ title, value, children }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      {title && (
        <h3 className="text-gray-500 text-sm mb-2">
          {title}
        </h3>
      )}

      {value && (
        <p className="text-3xl font-bold mb-2">
          {value}
        </p>
      )}

      {children}
    </div>
  );
};

export default Card;