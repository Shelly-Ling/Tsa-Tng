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
  // 可以試試分類宣告的東西，不穿插放置，比較一目了然我資料從 全域 state 抓來 或 組件中宣告，比較易讀 (強迫症)
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
    setTimeout(() => setIsDeleteModalShown(false), 800);
  }


// 當 function 有 多個參數時，建議參數改為單一個物件傳遞，並視情況給上預設值，這樣調用的時候可以只寫上必要的參數。
// ex: function editOrderNum({ e = null, item = {}, newQty = 0 }) { ... }
// 調用範例見下方: 調用參數改為物件例子
  function editOrderNum(e, item, newQty) {
    //  e.stopPropagation(); 這邊沒有錯，但狀態的改變是用 toolkit 控制 state，所以不阻擋冒泡應該也沒關係，可以拿掉，有必要的情況再使用，也可以不拿，個人習慣寫法而已
    // 比較常用的是 a 、 button 標籤的 click 行為，會用 e.preventDefault(); 來停止瀏覽器預設行為，交由後續 js 控制
    e.stopPropagation();

    // dispatch 的 { ...item, qty: newQty } 這一段 "組資料的操作" 在 updateOrder 的 slice 中 操作會比較適合，不然 感覺 slice 就淪為只有把 資料存進 state 的功能。
    // 點餐專案沒有複雜的操作所以看上去還好，但是若是這一段組新資料的情境比較複雜，組新資料的邏輯寫在 component 中 就會讓 component 變的冗長
    // 複雜情境舉例: 比如購物車勾選結帳商品，要記算總金額跟更新與畫面 ui 掛鉤的狀態

    // 官網範例可以看到是在 createSlice 的 reducers 操作 state 的更動  :https://redux-toolkit.js.org/api/createSlice
    dispatch(updateOrder({ ...item, qty: newQty }));
  }

  function handleEditOrder(food) {
    dispatch(setSelectedFood(food));
    setIsModalShown(true); // 這邊 也可以把 modal 是否顯示的 狀態存於全域

    // 我發現我之前對 modal 的說法可能讓你誤會，我重述一下想表達的整體意思是:
    // <modal> 的顯示與否要從 <modal isVisible={isModalShown}> props 決定，而不是從 <Modal> 中自己去抓全域 state 作為是否顯示的參數
    // 目前你這頁的 modal 實作也 ok，是同樣的邏輯，只是在我們專案中 <Modal> 的顯示設計成是從 <Modal> 接 props 值，但邏輯相同
  }

  function modalEditOrder() {
    // 這邊滿細心的有處理，我有看到按鈕設定為 disable，假設沒有 disable，可能就會跳提示之類的處理
    if (selectedFood.qty === 0) return;
    dispatch(updateOrder(selectedFood));
    setIsModalShown(false);
  }

  function modalDeleteOrder() {
    dispatch(removeOrder(selectedFood));
    setIsModalShown(false);
  }

  return (
    <div className="orderList">
      <div className="closeBtn" onClick={() => setIsCartShown(false)}>
        <MdOutlineClose />
      </div>
      {isDeleteModalShown && (
        <Modal>
          <p className="deleteModal"> 刪除成功^^</p>
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

          <div>
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
          </div>
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
                      // 調用參數改為物件例子:
                      // onClick={(e) => editOrderNum({
                      //   e,
                      //   item,
                      //   newQty: item.qty - 1)
                      // }}
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
