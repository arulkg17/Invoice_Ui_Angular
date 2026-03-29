import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/loginrequest';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  isLoginSuccess: boolean | null = null;
  userName = 'admin';
  password = 'password';
  message = '';

  constructor(private service: AuthService) {}
  login() {
    const param: LoginRequest = {
      userName: this.userName,
      password: this.password,
    };
    this.service.login(param).subscribe({
      next: (res) => {
        this.service.setSession(res.token, res.expiration);
        this.isLoginSuccess = true;
        this.message = 'Login Successfull';
      },
      error: (err) => {
        this.isLoginSuccess = false;
        this.message = 'Login Failed';
        console.error(err);
      },
    });
  }
 }
