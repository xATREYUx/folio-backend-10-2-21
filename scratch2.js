router.post("/", auth, (req, res) => {
  console.log("---postsrouter post---");
  if (req.method !== "POST") {
    console.log("method not allowed");
    return res.status(405).end();
  }

  const { uid } = req.user;

  const busboy = new Busboy({ headers: req.headers });
  console.log("---postsrouter req.headers---", req.headers);

  let fields = {};
  let imagesToUpload = [];
  let imageToAdd = {};
  let imageUrls = [];
  let newFileName = "";

  busboy.on("field", (fieldname, fieldvalue) => {
    console.log("---postsrouter busboy.on('field') initiated---");
    console.log(fieldname);
    fields[fieldname] = fieldvalue;
  });

  busboy.on("file", (fieldname, file, filename, mimetype) => {
    console.log("---postsrouter busboy.on('file') initiated---");

    // Getting extension of any image
    let urlId = nanoid();
    newFileName =
      path.parse(filename).name + "-" + urlId + path.parse(filename).ext;
    console.log("fileName+urlId+extension", newFileName);

    // Creating path
    const filepath = path.join(os.tmpdir(), newFileName);
    imageToAdd = {
      newFileName,
      filepath,
      mimetype,
    };

    file.pipe(fs.createWriteStream(filepath));
    //Add the image to the array
    imagesToUpload.push(imageToAdd);
  });

  busboy.on("finish", async () => {
    console.log("---postsrouter busboy.on('finish') initiated---");

    let promises = [];

    const uploadFile = async ({ token, imageToBeUploaded }) =>
      await admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: true,
          destination: `postImages/${imageToBeUploaded.newFileName}`,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype,
              firebaseStorageDownloadTokens: token,
            },
          },
        });

    imagesToUpload.forEach((imageToBeUploaded) => {
      imageUrls.push(
        `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/postImages%2F${encodeURI(imageToBeUploaded.newFileName)}?alt=media`
      );

      let token = uuidv4();
      promises.push(
        uploadFile({ token, imageToBeUploaded }).catch((err) =>
          console.log("uploadFile Error", err)
        )
      );
    });
  });

  busboy.end(req.rawBody);
});
