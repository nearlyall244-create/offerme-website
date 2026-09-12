import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/config/firebase'

export const storageService = {
  async uploadFile(file, path, onProgress) {
    const storageRef = ref(storage, path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        }
      )
    })
  },

  async uploadMultiple(files, basePath) {
    const uploads = files.map((file, index) => {
      const timestamp = Date.now()
      const path = `${basePath}/${timestamp}_${index}_${file.name}`
      return this.uploadFile(file, path)
    })
    return Promise.all(uploads)
  },
}
