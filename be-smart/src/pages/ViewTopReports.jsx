import Chatbot from '../components/chatbot/chatbot';

const posts = [
    {
      id: 1,
      title: 'PC Building & Repair Services Needed - Downtown Greensboro',
      href: '#',
      description:
        'Local tech startup needs custom PC builds for their new office. Seeking verified technicians who can assemble gaming and workstation PCs. Must be able to work locally - no shipping required. Community-sponsored opportunity with verified payment through the platform.',
      date: 'Jan 15, 2024',
      datetime: '2024-01-15',
      category: { title: 'gig', href: '#' },
      author: {
        name: 'TechStart Greensboro',
        role: 'Verified Small Business',
        href: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    {
      id: 2,
      title: 'Weekend Event Staff Needed - Toyota Battery Plant Community Fair',
      href: '#',
      description: 'Community-sponsored event at the new Toyota Battery Manufacturing facility needs local event staff for setup, coordination, and breakdown. Perfect for residents in economically distressed neighborhoods seeking flexible weekend work. Transportation assistance available for qualified applicants.',
      date: 'Jan 12, 2024',
      datetime: '2024-01-12',
      category: { title: 'sponsored', href: '#' },
      author: {
        name: 'Greensboro Community Partnership',
        role: 'Community Organization',
        href: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    {
      id: 3,
      title: 'Local Food Truck Needs Part-Time Social Media Manager',
      href: '#',
      description:
        'Growing food truck business in East Greensboro needs help managing Instagram and Facebook accounts. Flexible hours, perfect for students or those looking for side income. Remote work possible, but local knowledge of Greensboro neighborhoods is a plus. Small business owner seeking someone who understands the local community.',
      date: 'Jan 10, 2024',
      datetime: '2024-01-10',
      category: { title: 'business', href: '#' },
      author: {
        name: 'Carolina Eats Food Truck',
        role: 'Local Small Business',
        href: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    {
      id: 4,
      title: 'Handyman Services - Multiple Home Repair Jobs in Westside',
      href: '#',
      description:
        'Property management company has 15+ small repair jobs across Westside neighborhood. Seeking local handypersons for painting, minor plumbing, and basic carpentry. Jobs are within 5-mile radius - perfect for those without reliable transportation. Verified payment and steady work for qualified applicants.',
      date: 'Jan 8, 2024',
      datetime: '2024-01-08',
      category: { title: 'gig', href: '#' },
      author: {
        name: 'Greensboro Property Solutions',
        role: 'Verified Business',
        href: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    {
      id: 5,
      title: 'Local Tutoring Gigs - Math & Science Support for High School Students',
      href: '#',
      description:
        'Community center sponsoring after-school tutoring program needs qualified tutors. Focusing on students in economically distressed areas. Flexible scheduling, work from community centers or online. Great opportunity for college students or recent graduates looking to give back while earning income.',
      date: 'Jan 5, 2024',
      datetime: '2024-01-05',
      category: { title: 'sponsored', href: '#' },
      author: {
        name: 'Greensboro Youth Initiative',
        role: 'Community Organization',
        href: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    {
      id: 6,
      title: 'Graphic Design Needed - Small Business Branding Package',
      href: '#',
      description:
        'New local bakery opening in downtown needs logo design, menu layout, and social media graphics. Budget-conscious small business owner seeking talented local designer. Preference for designers who understand Greensboro\'s local culture and can work within budget. Great portfolio-building opportunity.',
      date: 'Jan 3, 2024',
      datetime: '2024-01-03',
      category: { title: 'business', href: '#' },
      author: {
        name: 'Sweet Greensboro Bakery',
        role: 'Startup Business',
        href: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
  ]
  
  export default function ViewTopReports() {
    return (
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">Top Local Gigs</h2>
            <p className="mt-2 text-lg/8 text-gray-300">Discover verified local opportunities, community-sponsored gigs, and small business needs across Greensboro.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-700 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.datetime} className="text-gray-400">
                    {post.date}
                  </time>
                  <a
                    href={post.category.href}
                    className="relative z-10 rounded-full bg-gray-800/60 px-3 py-1.5 font-medium text-gray-300 hover:bg-gray-800"
                  >
                    {post.category.title}
                  </a>
                </div>
                <div className="group relative grow">
                  <h3 className="mt-3 text-lg/6 font-semibold text-white group-hover:text-gray-300">
                    <a href={post.href}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm/6 text-gray-400">{post.description}</p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4 justify-self-end">
                  <img alt="" src={post.author.imageUrl} className="size-10 rounded-full bg-gray-800" />
                  <div className="text-sm/6">
                    <p className="font-semibold text-white">
                      <a href={post.author.href}>
                        <span className="absolute inset-0" />
                        {post.author.name}
                      </a>
                    </p>
                    <p className="text-gray-400">{post.author.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-700 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3"></div>
        </div>
        <Chatbot />
      </div>
    )
  }
  