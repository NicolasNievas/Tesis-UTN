import React from "react";
import { IProductData } from "@/interfaces/data.interfaces";

interface ProductListItemProps {
  product: IProductData;
  onEdit: (product: IProductData) => void;
  onDelete: (productId: number) => void;
  onReactive: (productId: number) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ product, onEdit, onDelete, onReactive }) => {
    return (
      <tr className="border-b text-center">
        <td className="p-2 flex justify-center items-center">
          <img src={product.imageUrls[0]} alt={product.name} className="w-16 h-16 object-cover" />
        </td>
        <td className="p-2">{product.name}</td>
        <td className="p-2">{product.price}</td>
        <td className="p-2">{product.stock}</td>
        <td className="p-2">{product.active ? "Yes" : "No"}</td>
        <td className="p-2  justify-center space-x-2">
          <button onClick={() => onEdit(product)} className="bg-yellow-500 p-2 rounded-md hover:bg-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>
          </button>
          <button onClick={() => onDelete(product.id)} className="bg-red-500 p-2 rounded-md hover:bg-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
          </button>
          <button onClick={() => onReactive(product.id)} className="bg-green-500 p-2 rounded-md hover:bg-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z"/><path d="M8 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 1z"/><path fillRule="evenodd" d="M8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 0z"/></svg>
          </button>
        </td>
      </tr>
    );
  };
  
  export default ProductListItem;