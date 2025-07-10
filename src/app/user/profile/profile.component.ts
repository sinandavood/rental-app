import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profilePic: string = '';
  memberSince: string = '';
  loading: boolean = true; // ✅ Add this

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const userId = user?.nameid;

    if (userId) {
      this.authService.getUserProfile(userId).subscribe({
        next: (res) => {
          this.user = res;
          this.profilePic = this.authService.getUserProfilePic() || '';
          this.memberSince = res.joinedAt
            ? new Date(res.joinedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : '';
          this.loading = false; // ✅ Done loading
        },
        error: (err) => {
          console.error('Failed to fetch profile:', err);
          this.loading = false; // Still hide loader on error
        }
      });
    } else {
      this.loading = false; // No user found
    }
  }

  isKycVerified(): string {
    return this.user?.isKycVerified ? '✅ Verified' : '❌ Not Verified';
  }

  isPhoneNumberempty():any{
  if(this.user?.phoneNumber==null)
  {
    return "Phone Number not added"
  }
  else{
   return  this.user.phoneNumber
  }
}
}
