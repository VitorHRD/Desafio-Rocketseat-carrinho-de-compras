import { createReadStream } from 'fs';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart")

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updateCard = [...cart]
      const productExist = updateCard.find((product) => { return product.id === productId })

      const stock= await api.get(`/stock/${productId}`)
      const stockAmount = stock.data.amount
      const currentAmount = productExist ? productExist.amount : 0 ;
      const amount = currentAmount + 1
      if(amount > stockAmount){
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }
      if(productExist){
         productExist.amount = amount
      }
      else{
        const product = await api.get(`/products/${productId}`)
        const newProduct = {
          ...product.data ,
          amount : 1
        }
        updateCard.push(newProduct)
      }
      setCart(updateCard)
      localStorage.setItem("@RocketShoes:cart",JSON.stringify(updateCard))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart];
     const updateCart = newCart.filter((product)=>{return product.id !== productId})
      setCart(updateCart)
      localStorage.setItem("@RocketShoes:cart",JSON.stringify(updateCart))
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
