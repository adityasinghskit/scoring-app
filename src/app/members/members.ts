import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../member-service';
import { DialogService } from '../dialog-service';

@Component({
  selector: 'app-members',
  imports: [FormsModule,RouterLink],
  templateUrl: './members.html',
  styleUrl: './members.css'
})
export class Members implements OnInit{
  public memberService = inject(MemberService);
  public dialogService = inject(DialogService);
  newMemberName = signal('');
  ngOnInit(): void {
  }
}
