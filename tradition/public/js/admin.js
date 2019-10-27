const deleteProduct = async (btn) => {
  const parentNode = btn.parentNode;
  const productId = parentNode.querySelector('[name="productId"]').value
  const csrf = parentNode.querySelector('[name="_csrf"]').value
  const articleEl = btn.closest('article')

  try {
    const res = await fetch(`/admin/product/${productId}`, {
      method: 'DELETE',
      headers: {
        'csrf-token': csrf
      }
    })

    articleEl.parentNode.removeChild(articleEl)

    console.log('res', res)
  } catch (error) {
    console.log('error', error)
  }
}