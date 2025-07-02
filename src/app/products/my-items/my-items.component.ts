import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from 'src/app/models/product.model';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TruncatePipe } from 'src/app/Pipes/truncate.pipe';
import { trigger, style, animate, transition, stagger, query } from '@angular/animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-items',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbTooltipModule, TruncatePipe],
  templateUrl: './my-items.component.html',
  styleUrls: ['./my-items.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        query('.item-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class MyItemsComponent implements OnInit {
  myItems: Product[] = [];
  isLoading = false;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.fetchMyItems();
  }

  fetchMyItems(): void {
    this.isLoading = true;
    this.productService.getMyItems().subscribe({
      next: (items) => {
        this.myItems = items;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to load your items.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  editItem(item: Product): void {
    this.router.navigate(['/edit-item', item.id]);
  }

  deleteItem(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to recover this item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteItem(id).subscribe({
          next: () => {
            this.myItems = this.myItems.filter(i => i.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Your item has been deleted.',
              icon: 'success',
              confirmButtonColor: '#3085d6'
            });
          },
          error: () => {
            Swal.fire({
              title: 'Failed',
              text: 'Could not delete the item.',
              icon: 'error',
              confirmButtonColor: '#3085d6'
            });
          }
        });
      }
    });
  }

 

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholder-image.jpg';
  }
}