import { useEffect, useState } from 'react';
import { BsTrashFill } from 'react-icons/bs';
import {
  MdOutlineAddCircle,
  MdOutlineClose,
  MdOutlineRemoveCircle,
} from 'react-icons/md';

import { useDispatch, useSelector } from 'react-redux';
import {
  removeOrder,
  setSelectedFood,
  updateOrder,
} from '../../redux/orderListApi';
import Modal from '../Modal/Modal';
import './OrderList.scss';

function OrderList({ closeBtn, setIsCartShown }) {
  const dispatch = useDispatch();
  const order = useSelector((state) => state.order.items);
  const selectedFood = useSelector((state) => state.order.selectedFood);
  const [isModalShown, setIsModalShown] = useState(false);
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 960 && closeBtn) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [closeBtn]);

  function deleteOrder(e, id) {
    e.stopPropagation();
    dispatch(removeOrder(id));
    setIsDeleteModalShown(true);
    setTimeout(() => setIsDeleteModalShown(false), 700);
  }

  function editOrderNum(e, item, newQty) {
    e.stopPropagation();
    dispatch(updateOrder({ ...item, qty: newQty }));
  }

  function handleEditOrder(food) {
    dispatch(setSelectedFood(food));
    setIsModalShown(true);
  }

  function modalEditOrder() {
    if (selectedFood.qty === 0) return;
    dispatch(updateOrder(selectedFood));
    setIsModalShown(false);
    dispatch(setSelectedFood(null));
  }

  function modalDeleteOrder() {
    dispatch(removeOrder(selectedFood));
    setIsModalShown(false);
    dispatch(setSelectedFood(null));
  }

  return (
    <div className="orderList">
      <div className="closeBtn" onClick={() => setIsCartShown(false)}>
        <MdOutlineClose />
      </div>
      {isDeleteModalShown && (
        <Modal>
          <p className="deleteModal"> 刪除成功</p>
          <div className="timerBar" />
        </Modal>
      )}
      {isModalShown && (
        <Modal>
          <img
            src={selectedFood.img}
            alt={selectedFood.name}
            width="100%"
            height="100"
            className="foodImg"
          />
          <div className="closeBtn">
            <MdOutlineClose onClick={() => setIsModalShown(false)} />
          </div>
          <div className="titleContainer">
            <p className="popUpTitle">{selectedFood.name}</p>
            <p>${selectedFood.price}</p>
          </div>
          <p className="popUpDescription">{selectedFood.description}</p>

          <p>餐點備註</p>
          <textarea
            name="orderNote"
            rows={3}
            cols={30}
            value={selectedFood.note}
            onChange={(e) =>
              dispatch(
                setSelectedFood({
                  ...selectedFood,
                  note: e.target.value,
                })
              )
            }
          />
          <div className="addToCartContainer">
            <input
              className="addOrderNum"
              type="number"
              min="1"
              value={selectedFood.qty}
              onChange={(e) =>
                dispatch(
                  setSelectedFood({
                    ...selectedFood,
                    qty: Number(e.target.value),
                  })
                )
              }
            />
            <div className="addToCartContainer">
              <button onClick={modalDeleteOrder} className="trashBtn">
                <BsTrashFill />
              </button>
              <button
                onClick={modalEditOrder}
                className={
                  selectedFood.qty === 0
                    ? 'addToCartBtn defaultAddCartBtn'
                    : 'addToCartBtn'
                }>
                修改訂單
              </button>
            </div>
          </div>
        </Modal>
      )}
      <h3 className="orderTitle">您的訂單</h3>
      {order.length === 0 && (
        <div className="noOrder">
          購物車還沒有任何物品
          <br />
          立即開始訂購喜愛的產品吧！
        </div>
      )}
      {order.length !== 0 && (
        <ul className="orderItems">
          {order.map((item) => (
            <li
              key={item.time}
              className="orderItem"
              onClick={() => handleEditOrder(item)}>
              <div className="orderDetail">
                <h4>{item.name}</h4>
                <div className="itemNum">
                  {item.qty === 1 ? (
                    <BsTrashFill onClick={(e) => deleteOrder(e, item.id)} />
                  ) : (
                    <MdOutlineRemoveCircle
                      onClick={(e) => editOrderNum(e, item, item.qty - 1)}
                    />
                  )}
                  <p>{item.qty}</p>
                  <MdOutlineAddCircle
                    onClick={(e) => editOrderNum(e, item, item.qty + 1)}
                  />
                </div>
              </div>
              <div className="orderDetail">
                <div className="note">
                  {item.note && <div>{item.note}</div>}
                </div>
                <p>${item.price * item.qty}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="total">
        <p className="totalItemNum">
          共計{order.reduce((acc, val) => acc + val.qty, 0)}件
        </p>
        <p className="totalPrice">
          <span>總計$</span>
          <span>
            {order.reduce((acc, val) => acc + val.price * val.qty, 0)}
          </span>
          <span>TWD</span>
        </p>
      </div>
      <button className="checkoutBtn">結帳</button>
    </div>
  );
}
export default OrderList;