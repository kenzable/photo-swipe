const { Router } = require('express');
const {
  createAlbum,
  getAlbums,
  getAlbumPhotos,
  getSharedAlbums,
  joinAlbum,
  activateAlbum,
  updateTaggedUsers,
} = require('./albums');
const { addShareToken, getSharedUsers, addSharedAlbum } = require('./user');

const router = Router();

router.post('/memberships', async (req, res) => {
  const { shareToken } = req.body;
  const userToken = req.user.token;

  console.log('who is user?', req.user);

  try {
    const album = await joinAlbum(userToken, shareToken);
    res.json({ album });
  } catch (err) {
    console.log('ERRRRRRR', err);
    res.status(500).json(err);
  }
});

router.post('/:albumId/activate', async (req, res) => {
  const { albumId } = req.params;
  const userToken = req.user.token;

  try {
    // this will add sharetokens to users who were tagged in this specific album
    const [shareToken, shareUsers] = await Promise.all([
      activateAlbum(userToken, albumId),
      getSharedUsers(albumId)
    ]);
    shareUsers.forEach(async user => {
      await addShareToken(user, shareToken);
    });
    res.json({ shareToken });
  } catch (err) {
    console.log('ERRRRRRR', err);
    res.status(500).json(err);
  }
});

router.get('/:albumId/photos', async (req, res) => {
  const { albumId } = req.params;
  const userToken = req.user.token;
  try {
    const photos = await getAlbumPhotos(userToken, albumId);
    res.json({ photos });
  } catch (err) {
    console.log('ERRRRRRR', err);
    res.status(500).json(err);
  }
});

router.get('/:albumId/photos/:photoId/users', async (req, res) => {
  const { albumId, photoId } = req.params;

  try {
    await getTaggedUsers(albumId, photoId);
    console.log('SUCCESS!');
  } catch (err) {
    console.log('ERRRRRRR', err);
    res.status(500).json(err);
  }
});

router.post('/:albumId/photos/:photoId/users', async (req, res) => {
  const { albumId, photoId } = req.params;
  const { taggedUsers } = req.body;

  try {
    await Promise.all([
      addSharedAlbum(userEmail, albumId), 
      updateTaggedUsers(albumId, photoId, taggedUsers)
    ]);
    console.log('SUCCESS!');
  } catch (err) {
    console.log('ERRRRRRR', err);
    res.status(500).json(err);
  }
});

router.get('/shared', async (req, res) => {
  const userToken = req.user.token;

  try {
    const albums = await getSharedAlbums(userToken);
    console.log('Total number of shared albums:', albums.length);
    res.json({ albums });
  } catch (err) {
    console.log('ERRRRRRR', err);
    res.status(500).json(err);
  }
});

router.get('/', async (req, res) => {
  const userToken = req.user.token;
  try {
    const albums = await getAlbums(userToken);
    console.log('Total number of albums:', albums.length);
    res.json({ albums });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  const userToken = req.user.token;
  const title = `PS Album: ${req.body.albumTitle}`;
  try {
    const album = await createAlbum(userToken, title);
    res.json({ album });
  } catch (err) {
    console.log('ERRRRRRR', err);
    res.status(500).json(err);
  }
});

module.exports = router;
