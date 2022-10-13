var express = require('express');
const { response } = require('../app');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var adminhelper = require('../helpers/admin-helpers');
var userHelpers = require('../helpers/user-helpers');
//for runnning without auth

//end

const verifyAdmin = (req, res, next) => {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  if (req.session.adminLoggedIn) {
    console.log(req.session.adminLoggedIn);
    next()
  } else {
    //res.redirect('/admin')
    next()
  }
}
/* GET users listing. */
router.get('/', (req, res, next) => {

  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");

  if (req.session.admin) {
    res.redirect('/admin/home')
  } else {
    res.render('admin/login', { admin: false, layout: 'admin' });
    req.session.adminLoginErr = false
  }


});

router.post('/login', (req, res) => {
  console.log(req.body);
  adminhelper.doAdminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin/home')
    } else {
      res.redirect('/admin')
    }
  })
});

router.get('/home', verifyAdmin, (req, res, next) => {
  res.render('admin/home', { admin: true, layout: 'admin' });
});


router.get('/user-management', verifyAdmin, (req, res, next) => {
  adminhelper.getAllUsers().then((userData) => {
    res.render('admin/user-management', { admin: true, layout: 'admin', userData });
  })

});

router.get('/product-management', verifyAdmin, (req, res, next) => {
  productHelper.getAllProducts().then((products) => {
    console.log(products);
    res.render('admin/product-management', { admin: true, layout: 'admin', products });
  })
});

router.get('/category-management', verifyAdmin, (req, res, next) => {
  productHelper.getAllCategories().then((category) => {
    res.render('admin/category-management', { admin: true, layout: 'admin', category });
  })

});

router.get('/add-product', verifyAdmin, (req, res, next) => {
  productHelper.getAllCategories().then((category) => {
    res.render('admin/add-product', { admin: true, layout: 'admin', category });
  })
});

router.post('/add-product', (req, res) => {
  console.log(req.body);
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.Image
    picId = id.insertedId
    image.mv('./public/product-images/' + picId + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/add-product')
      } else {
        console.log("error in image upload")
      }
    })

  })
});

router.get('/logout', (req, res) => {

  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin')
})

router.get('/add-category', verifyAdmin, (req, res, next) => {
  res.render('admin/add-category', { admin: true, layout: 'admin' });
});

router.post('/add-category', (req, res) => {
  if (req.body.category) {
    productHelper.addCatogory(req.body, (data) => {
      let image = req.files.Image
      picId = data.insertedId
      image.mv('./public/category-images/' + picId + '.jpg', (err, done) => {
        if (!err) {
          res.redirect('/admin/add-category')
        } else {
          res.send("image error")
          console.log("error in image upload");
        }
      })
    })
  } else {

    res.send("category name cannot be empty")
  }

});

router.get('/delete-product/:id', verifyAdmin, (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelper.deleteProduct(proId).then((response) => {
    res.redirect('/admin/product-management')

  })

})

router.get('/delete-user/:id', verifyAdmin, (req, res) => {
  let userId = req.params.id
  adminhelper.deleteUser(userId).then((response) => {
    res.redirect('/admin/user-management')

  })

})

router.get('/delete-category/:id', verifyAdmin, (req, res) => {
  let catId = req.params.id

  adminhelper.deleteCategory(catId).then((response) => {
    res.redirect('/admin/category-management')

  })

})

router.get('/edit-product/', verifyAdmin, async (req, res) => {
  let product = await productHelper.getProductDetails(req.query.id)
  productHelper.getAllCategories().then((category) => {
    res.render('admin/edit-product', { admin: true, layout: 'admin', product, category })

  })
})
router.get('/edit-category/', verifyAdmin, async (req, res) => {
  let category = await productHelper.getCategoryDetails(req.query.id)

  res.render('admin/edit-category', { admin: true, layout: 'admin', category })

})

router.post('/edit-category/', (req, res) => {
  console.log("dgsdgsdfghfsdhfd", req.query.id);
  productHelper.updateCategory(req.query.id, req.body).then(() => {
    res.redirect('/admin/category-management')
  })
})

router.post('/edit-product/', (req, res) => {

  productHelper.updateProduct(req.query.id, req.body).then(() => {
    picId = req.query.id
    res.redirect('/admin/product-management')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + picId + '.jpg')
    }
  })
})

router.get('/block/', verifyAdmin, (req, res) => {
  let userID = req.query.id
  userHelpers.doBlockUser(userID).then(() => {
    res.redirect('/admin/user-management')
  })
})

router.get('/unblock/', verifyAdmin, (req, res) => {
  let userID = req.query.id
  userHelpers.doUnBlockUser(userID).then(() => {
    res.redirect('/admin/user-management')
  })
})

router.get('/hidefeature/:id', (req, res) => {
  let proid = req.params.id
  console.log("kjhbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", proid);
  productHelper.doHideFeature(proid).then(() => {
    res.send("ffffffffff")
  })
})

module.exports = router;
