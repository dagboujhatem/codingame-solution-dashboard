import { Injectable, inject } from '@angular/core';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UploadAvatarService {
    private storage = getStorage();
    private auth = getAuth();
    private authService = inject(AuthService);

    async uploadAvatar(file: File): Promise<string> {
        const user = this.auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const avatarRef = ref(this.storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, file);
        const downloadUrl = await getDownloadURL(avatarRef);

        await updateProfile(user, { photoURL: downloadUrl });
        this.authService.loadUserAvatar();

        return downloadUrl;
    }
}
